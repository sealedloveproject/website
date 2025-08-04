# Sealed Love Website

A Next.js application for archiving and sharing love stories, built with modern web technologies and designed for scalable deployment.

💝 **This is the heart of our website** - the core codebase that powers the platform where love stories are preserved and shared. We continue to develop this project with love and dedication for everyone who believes in the beauty of love stories and wants to be part of this journey.

## 🚀 Tech Stack

- **Framework**: [Next.js 15.3.3](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Database**: [Prisma](https://prisma.io) ORM
- **Authentication**: [NextAuth.js 5](https://next-auth.js.org)
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Process Manager**: PM2
- **Deployment**: GitHub Actions + Custom Server

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MariaDB (or MySQL/PostgreSQL/SQLite)
- Redis for caching and session management
- AWS S3 bucket (for file storage)
- SendGrid account (for emails)

## 🛠️ Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd website
npm install
```

### 2. Database and Cache Services

The application requires both MariaDB (or MySQL) and Redis services. You can run these using Docker:

```bash
# Start MariaDB container
docker run --name mariadb -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=sealedlove -p 3306:3306 -d mariadb:latest

# Start Redis container
docker run --name redis -p 6379:6379 -d redis:latest
```

Alternatively, you can install and run these services natively on your system.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (MariaDB/MySQL)
DATABASE_URL="mysql://root:yourpassword@localhost:3306/sealedlove"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket-name"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="your-from-email"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup with Prisma

```bash
# Generate Prisma client
npx prisma generate

# Create and apply database migrations
npx prisma migrate dev --name init

# If you encounter drift detection (existing DB vs new migrations):
npx prisma migrate reset  # This will drop the database and apply migrations

# (Optional) Seed the database
npm run prisma:seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

#### Database Migration Workflow (Development)

```bash
# When making schema changes, create a new migration
npx prisma migrate dev --name <descriptive-name>

# After pulling changes with migrations from others
npx prisma migrate dev

# If you encounter conflicts or drift
npx prisma migrate reset  # Warning: This erases all data
```

**Important:** Always commit the generated migration files in the `prisma/migrations` directory to your repository.

### 5. Development Server

```bash
# Start development server with Turbopack
npm run dev

# Or with standard Next.js
next dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run prisma:seed       # Seed database with initial data
npx prisma studio         # Open Prisma Studio
npx prisma generate       # Generate Prisma client

# Development migrations
npx prisma migrate dev --name <migration-name>  # Create a new migration
npx prisma migrate dev     # Apply pending migrations in development
npx prisma migrate reset   # Reset database (WARNING: erases all data)

# Production migrations
npx prisma migrate deploy   # Apply migrations in production (no schema changes)
```

## 🚀 Production Deployment

### Server Requirements

- Node.js 18+
- PM2 process manager
- Nginx (recommended for reverse proxy)
- SSL certificate
- MariaDB/MySQL database server
- Redis server

### Automated Deployment

This project uses GitHub Actions for automated deployment:

1. **Configure GitHub Secrets**:
   - `SERVER_HOST` - Your server IP/domain
   - `SERVER_USER` - SSH username
   - `SERVER_SSH_KEY` - Private SSH key
   - `SERVER_PORT` - SSH port (default: 22)

2. **Server Setup**:
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Create application directory
   mkdir -p /apps/website
   ```

3. **Database and Redis Setup**:
   ```bash
   # For MariaDB/MySQL
   mysql -e "CREATE DATABASE sealedlove;"
   
   # Ensure Redis is installed and running
   systemctl status redis
   # or if using Docker
   docker run -d --name redis -p 6379:6379 redis:latest
   ```

4. **Database Migrations in CI/CD**:
   Update your GitHub Actions workflow file (`.github/workflows/deploy.yml`) to include:
   
   ```yaml
   # Example GitHub Actions migration step
   - name: Run database migrations
     run: |
       cd /apps/website/current
       npx prisma generate
       npx prisma migrate deploy
   ```
   
   Or for manual deployment:
   ```bash
   # After deployment, run Prisma migrations
   cd /apps/website/current
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Deploy**:
   - Push to `main` or `master` branch
   - GitHub Actions will automatically build and deploy
   - Zero-downtime deployment with PM2 graceful reload

### Manual Deployment

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or start directly
npm start
```

## 🔧 PM2 Process Management

```bash
# Start application
pm2 start ecosystem.config.js

# View running processes
pm2 list

# View logs
pm2 logs sealed-love-website

# Restart application
pm2 restart sealed-love-website

# Stop application
pm2 stop sealed-love-website

# Graceful reload (zero-downtime)
pm2 reload sealed-love-website
```

## 🗂️ Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── partials/           # Page-specific components
│   └── lib/                # Utility functions
├── public/
│   ├── images/
│   │   ├── flags/          # Country flag images
│   │   └── stories/        # Story-related images
│   └── favicon.ico
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── load-env.js         # Environment loader for seeding
├── .github/workflows/      # GitHub Actions
├── ecosystem.config.js     # PM2 configuration
└── package.json
```

## 🔒 License

This project is licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](LICENSE).

- ✅ **Allowed**: Review, share, and use for educational purposes
- ❌ **Prohibited**: Commercial use, creating derivatives, or replicas

## 🤝 Contributing

This project is made available for educational and review purposes. Commercial use or creating derivative works is prohibited under the license terms.

However, I welcome pull requests for:
- 🐛 Bug fixes
- 🎨 Design improvements and UI/UX enhancements
- 📝 Typo corrections and documentation improvements
- 🔧 Code quality improvements
- 🚀 Performance optimizations

Please ensure your contributions align with the project's goals and maintain the existing code style.

## 📞 Support

For questions or issues, please refer to the project documentation or contact the development team.
