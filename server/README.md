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
