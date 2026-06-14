# Esplenin Hotel Backend

Node.js, Express, and MongoDB backend for the Esplenin Hotel Reservation Management System.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and set `MONGODB_URI` to your local MongoDB or MongoDB Atlas connection string.

4. Seed rooms and amenities:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000/api/v1` by default and allows CORS from `http://localhost:5173`.

## Main Endpoints

- `GET /api/v1/rooms`
- `GET /api/v1/rooms/vacant`
- `POST /api/v1/bookings`
- `PATCH /api/v1/bookings/:referenceNumber/pay`
- `PATCH /api/v1/bookings/:referenceNumber/checkout`
- `GET /api/v1/amenities`
- `GET /api/v1/receipts/:orNumber/pdf`
