// User type definition
export type User = {
  id?: string;
  email: string;
  name?: string | null;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  image?: string | null;
};

// Authentication context type
export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  signIn: (email: string, firstName?: string, lastName?: string) => Promise<any>;
  updateUserProfile: (firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  verificationEmail?: string;
};

// Auth result from server actions
export type AuthResult = {
  token?: string; // Optional for backward compatibility
  user: {
    id: string;
    email: string;
    name: string | null;
    isAdmin?: boolean;
  };
};
