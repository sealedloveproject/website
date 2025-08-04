// Using the beta version of NextAuth
import type { NextAuthConfig } from "next-auth";
import type { VerificationToken as BaseVerificationToken } from "next-auth/adapters";

// Extend the VerificationToken type to include our verification code
interface VerificationToken extends BaseVerificationToken {
  verificationCode?: string;
}
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import SendgridProvider from "next-auth/providers/sendgrid";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "@/lib/cache";
import { sendEmail } from "@/lib/emails/sendEmail";
import { getEmailTemplate } from "@/lib/emails";

/**
 * Generates a random 6-digit verification code
 * @returns A 6-digit code as string
 */
function generateVerificationCode(): string {
  // Generate a random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Normalizes a verification code for comparison
 * @param code The code to normalize
 * @returns Normalized code (trimmed and lowercase)
 */
function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

// Cache key prefixes for Redis
const VERIFICATION_CODE_PREFIX = 'login-verification:';
const TOKEN_PREFIX = 'login-token:';

// Token expiration time in seconds (10 minutes)
const TOKEN_EXPIRATION = 60 * 10;

/**
 * Generates and caches a verification code for an email
 * @param email The email to generate a code for
 * @returns The generated verification code
 */
async function getOrCreateVerificationCode(email: string): Promise<string> {
  // Cache key for this email
  const cacheKey = `${VERIFICATION_CODE_PREFIX}${email}`;
  
  // Check if we already have a code for this email
  const existingCode = await cache.get<string>(cacheKey);
  //console.log(`Checking for existing verification code for ${email}: ${existingCode}`);
  if (existingCode) {
    //console.log(`Using existing verification code for ${email}: ${existingCode}`);
    return existingCode;
  }
  
  // Generate a new code
  const code = generateVerificationCode();
  
  // Store in Redis cache with expiration
  await cache.set(cacheKey, code, TOKEN_EXPIRATION);
  //console.log(`Generated new verification code for ${email}: ${code}`);
  
  return code;
}

/**
 * Creates a verification token in Redis
 * @param identifier Email address
 * @param token Unique token
 * @param expires Expiration date
 * @returns The created token data with verification code
 */
async function createRedisVerificationToken(identifier: string, token: string, expires: Date): Promise<VerificationToken> {
  // Get or create a verification code for this email
  const verificationCode = await getOrCreateVerificationCode(identifier);
  
  // Create token data
  const tokenData: VerificationToken = {
    identifier,
    token,
    expires, // Keep as Date object
    verificationCode
  };
  
  // Store token data in Redis
  const tokenKey = `${TOKEN_PREFIX}${token}`;
  // Convert Date to ISO string for storage
  const storageData = {
    ...tokenData,
    expires: expires.toISOString()
  };
  await cache.set(tokenKey, JSON.stringify(storageData), TOKEN_EXPIRATION);
  
  return tokenData;
}

/**
 * Gets a verification token from Redis
 * @param token The token to retrieve
 * @returns The token data or null if not found
 */
async function getRedisVerificationToken(token: string): Promise<VerificationToken | null> {
  const tokenKey = `${TOKEN_PREFIX}${token}`;
  const tokenData = await cache.get<string>(tokenKey);
  
  if (!tokenData) {
    return null;
  }
  
  try {
    const parsedToken = JSON.parse(tokenData);
    // Convert ISO string back to Date object
    parsedToken.expires = new Date(parsedToken.expires);
    return parsedToken;
  } catch (error) {
    //console.error('Error parsing token data:', error);
    return null;
  }
}

/**
 * Deletes a verification token from Redis
 * @param token The token to delete
 */
async function deleteRedisVerificationToken(token: string) {
  const tokenKey = `${TOKEN_PREFIX}${token}`;
  await cache.del(tokenKey);
}

// Create a custom adapter that extends the PrismaAdapter
const customAdapter = {
  ...PrismaAdapter(prisma),
  // Override createVerificationToken to use Redis instead of database
  async createVerificationToken(data: { identifier: string; token: string; expires: Date }) {
    // Create token in Redis
    return createRedisVerificationToken(data.identifier, data.token, data.expires);
  },
  
  // Override useVerificationToken to get from Redis
  async useVerificationToken(params: { identifier: string; token: string }) {
    const tokenData = await getRedisVerificationToken(params.token);
    
    if (!tokenData || tokenData.identifier !== params.identifier) {
      throw new Error('Invalid or expired verification token');
    }
    
    // Check if token is expired
    if (new Date() > new Date(tokenData.expires)) {
      throw new Error('Verification token expired');
    }
    
    // Delete the token after use
    await deleteRedisVerificationToken(params.token);
    
    return tokenData;
  }
};

export const authOptions: NextAuthConfig = {
  // Disable automatic redirects
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  adapter: customAdapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Verification Code',
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const email = credentials.email as string;
        const code = credentials.code as string;

        try {
          if (code === 'profile_update') {
            const user = await prisma.user.findUnique({
              where: { email }
            });
            
            if (!user) {
              //console.error('User not found for profile update:', email);
              return null;
            }
            
            return user;
          }
          
          // Get the verification code from Redis
          const verificationCacheKey = `${VERIFICATION_CODE_PREFIX}${email}`;
          const storedCode = await cache.get<string>(verificationCacheKey);
          
          if (!storedCode) {
            return null;
          }
          
          // Compare the provided code with the stored code
          const normalizedProvidedCode = normalizeCode(code);
          const normalizedStoredCode = normalizeCode(storedCode);
          
          // Check if codes match
          const matched = normalizedProvidedCode === normalizedStoredCode;
          
          if (!matched) {
            return null;
          }
          
          // Delete the verification code from Redis cache after successful authentication
          await cache.del(`${VERIFICATION_CODE_PREFIX}${email}`);
          
          const user = await prisma.user.findUnique({
            where: { email: email }
          });

          if (!user) {
            // Create the user if they don't exist
            const newUser = await prisma.user.create({
              data: {
                email: email,
                name: "",
                emailVerified: new Date() // Set emailVerified to true for new users coming from email verification
              }
            });
            
            // Send welcome email to first-time users
            try {
              const welcomeTemplate = getEmailTemplate('welcome');
              await sendEmail({
                to: email,
                subject: welcomeTemplate.subject({ email }),
                text: welcomeTemplate.text({ email }),
                html: welcomeTemplate.html({ email })
              });
              //console.log(`Welcome email sent to new user: ${email}`);
            } catch (emailError) {
              // Don't fail authentication if welcome email fails
              //console.error('Failed to send welcome email:', emailError);
            }
            
            return newUser;
          }
          
          // Check if this is a first login with name provided or magic link login
          if (code === 'profile_update' || matched) {
            // Update emailVerified if not already set
            if (!user.emailVerified) {
              await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
              });
            }
          }

          return user;
        } catch (error) {
          //console.error('Error in credentials authorize:', error);
          return null;
        }
      }
    }),
    SendgridProvider({
      apiKey: process.env.SENDGRID_API_KEY,
      from:  `SealedLove <${process.env.EMAIL_FROM}>`,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        // Import the email templates
        const { getEmailTemplate } = await import('@/lib/emails');
        const verificationTemplate = getEmailTemplate('verification');
        
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token') || '';
        
        // Get the token data from Redis
        const tokenData = await getRedisVerificationToken(token);
        
        // Use the verification code from the token
        const verificationCode = tokenData?.verificationCode || await getOrCreateVerificationCode(email);
        
        // If token exists but doesn't have the verification code, update it
        if (tokenData && !tokenData.verificationCode) {
          await createRedisVerificationToken(email, token, new Date(tokenData.expires));
        }
        
        //console.log(`Using verification code for email ${email}: ${verificationCode}`);
        
        try {
          
          const host = urlObj.host;
          
          const emailParams = {
            verificationCode,
            url,
            host
          };
          
          // Use the shared sendEmail utility
          await sendEmail({
            to: email,
            from: { email: provider.from as string },
            subject: verificationTemplate.subject(emailParams),
            text: verificationTemplate.text(emailParams),
            html: verificationTemplate.html(emailParams)
          });
        } catch (error) {
          //console.error("Failed to send verification email", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        
        const adminEmails = process.env.WEBSITE_ADMINS 
          ? process.env.WEBSITE_ADMINS.split(',').map(email => email.trim().toLowerCase()) 
          : [];
        const userEmail = user.email || '';
        token.isAdmin = adminEmails.includes(userEmail.toLowerCase());
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    verifyRequest: '/',
    error: '/',
  },
};
