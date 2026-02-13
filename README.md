# UG Gymnasium

University of Ghana Gymnasium Web Application

## Project Structure

This is a fullstack TypeScript application with three main components:

- **client/** - User-facing frontend (React + Vite + TypeScript)
- **admin/** - Admin dashboard frontend (React + Vite + TypeScript)
- **server/** - Backend API (Express + TypeScript)

## Tech Stack

### Frontend (Client & Admin)

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router (to be added)

### Backend (Server)

- Node.js
- Express
- TypeScript
- CORS
- dotenv

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd ug-gymnasium
```

2. Install dependencies for each component:

**Client:**

```bash
cd client
npm install
```

**Admin:**

```bash
cd admin
npm install
```

**Server:**

```bash
cd server
npm install
cp .env.example .env
```

### Development

Run each component in separate terminals:

**Client (Port 5174):**

```bash
cd client
npm run dev
```

**Admin (Port 5173):**

```bash
cd admin
npm run dev
```

**Server (Port 5000):**

```bash
cd server
npm run dev
```

### Build

**Client:**

```bash
cd client
npm run build
```

**Admin:**

```bash
cd admin
npm run build
```

**Server:**

```bash
cd server
npm run build
npm start
```

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check endpoint

## License

ISC
