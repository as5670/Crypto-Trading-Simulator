# Crypto Trading Simulator

An institutional-grade Crypto Trading Simulator featuring real-time price feeds, portfolio tracking, performance charts, and historic transaction logs. Practise trading Bitcoin, Ethereum, and Solana with zero risk using virtual balances.

---

## Architecture

This application is built as a decoupled Client-Server architecture:

```mermaid
graph TD
  Client[Next.js Client] <-->|HttpOnly Cookies / REST API| Backend[Express Backend]
  Client <-->|WebSockets| Backend
  Backend <-->|Prisma ORM| DB[(PostgreSQL Database)]
```

### Backend (`/server`)
- **Express.js**: Lightweight REST API server.
- **Prisma ORM**: Modern database access layer mapping schema changes to a PostgreSQL instance.
- **Socket.io**: Real-time WebSocket server broadcasting crypto prices updated every 5 seconds.
- **JWT Cookie Authentication**: Secure user session management using an `httpOnly` cookie named `token`, protecting backend APIs from unauthorized access and preventing XSS token theft.
- **Prisma Transactions ($transaction)**: Guarantees atomic trading operations (deducting cash, upserting holding quantity and average buy price, recording logs, and generating portfolio snapshots).

### Frontend (`/client`)
- **Next.js (App Router)**: Fast, server-side and client-side rendering framework.
- **Modular Component Design**: Decoupled presentation elements (`TickerStrip`, `TradeBar`, `PortfolioCard`, `TransactionTable`).
- **Custom React Hooks (`useCrypto.js`)**: Encapsulates state, WebSocket management, authentication redirects, and API request handling.
- **CSS Modules**: Modern encapsulated styling system to isolate component designs.
- **Recharts**: Beautiful line chart rendering real-time portfolio performance history.

---

## Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** instance (local server or cloud service like Neon)

### 2. Database Configuration
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create or update the `.env` file with your credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/crypto_db"
   JWT_SECRET="your_secure_jwt_secret"
   ```
3. Apply schema updates and generate the Prisma Client:
   ```bash
   npx prisma db push
   ```

### 3. Running the Server
1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Start the server (runs via `nodemon` on port `5000`):
   ```bash
   npm start
   ```

### 4. Running the Client
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Create a `.env` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Next.js development server (runs on port `3000`):
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to start trading!

---

## Known Limitations & Trade-offs

1. **Cold Starts**: If using a serverless database (like Neon) that goes to sleep, the first request may experience a slight delay or timeout while the database spins up.
2. **Socket.io Authentication**: Socket.io connections are currently public and unauthenticated. Anyone can connect and listen to price update broadcasts, which is acceptable since market prices are public data.
3. **Decimal Serialization**: Database fields (balance, prices) use high-precision `Decimal` types. In transit (JSON responses), these are converted to Javascript numbers for seamless frontend consumption and parsing.
