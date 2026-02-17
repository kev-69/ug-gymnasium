# UG Gymnasium Server

Backend API for the University of Ghana Gymnasium application..

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Payment**: Paystack

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Paystack public key
- `EMAIL_HOST` - SMTP server host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP server port (e.g., 587)
- `EMAIL_SECURE` - Use TLS (true/false)
- `EMAIL_USER` - Email account username
- `EMAIL_PASSWORD` - Email account password (use App Password for Gmail)
- `CONTACT_EMAIL` - Email address to receive contact form submissions

## Installation

```bash
npm install
```

## Database Setup

1. Make sure PostgreSQL is running (via Docker or locally)
2. Run Prisma migrations:

```bash
npm run prisma:migrate
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. (Optional) Seed the database:

```bash
npm run prisma:seed
```

## Email Setup

The application sends emails for:

- **Contact form** submissions
- **Subscription confirmations** when users successfully subscribe
- **Expiration warnings** a few days before subscription expires
- **Expiration notifications** when subscription expires

All email functionality uses nodemailer. Follow these steps to set up:

1. Install nodemailer (if not already installed):

```bash
npm install nodemailer @types/nodemailer
```

2. Configure email settings in your `.env` file:

### Using Gmail

To use Gmail as your SMTP server:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Update your `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
CONTACT_EMAIL=info@gymnasium.ug.edu.gh
EXPIRATION_WARNING_DAYS=3
```

**Email Configuration:**

- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port (587 for TLS)
- `EMAIL_SECURE`: Set to `true` for port 465, `false` for others
- `EMAIL_USER`: Your email account
- `EMAIL_PASSWORD`: Your email password (use App Password for Gmail)
- `CONTACT_EMAIL`: Email address to receive contact form submissions
- `EXPIRATION_WARNING_DAYS`: Days before expiration to send warning (default: 3)

### Using Other Email Providers

For other providers (SendGrid, Mailgun, etc.), consult their SMTP documentation and update the settings accordingly.

### Testing Email Locally

For development, you can use services like:

- [Mailtrap](https://mailtrap.io/) - Fake SMTP server for testing
- [Ethereal Email](https://ethereal.email/) - Fake SMTP service by nodemailer

Update your `.env` with the test SMTP credentials during development.

## Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will start on http://localhost:5000

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts            # Seed data
├── src/
│   ├── config/            # Configuration files
│   │   └── database.ts    # Prisma client instance
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   │   └── morgan.ts      # HTTP request logger
│   ├── models/            # Database models (if needed)
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   │   └── logger.ts      # Winston logger
│   ├── validators/        # Zod schemas
│   └── index.ts           # Entry point
├── logs/                  # Log files (git ignored)
├── .env                   # Environment variables (git ignored)
├── .env.example           # Example environment variables
├── tsconfig.json          # TypeScript configuration
├── nodemon.json           # Nodemon configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Health Check

- `GET /` - Welcome message
- `GET /api/health` - Health check status

More endpoints will be added as development continues.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. After making changes:

1. Create a migration: `npm run prisma:migrate`
2. Generate the client: `npm run prisma:generate`

## Logging

- Console logs in development
- File logs in `logs/` directory:
  - `all.log` - All logs
  - `error.log` - Error logs only

## Docker

Coming soon - Docker configuration for containerization.

## License

ISC
