# CSE416-SBU12-P4SBU

A full-stack web application for managing campus parking and reservations, built with React, Node.js/Express, PostgreSQL/PostGIS, and Stripe for payments. Deployed at [Website](sbuparking.live)

## Table of Contents

* [Features](#features)
* [Architecture](#architecture)
* [Prerequisites](#prerequisites)
* [Installation](#installation)

  * [Backend Setup](#backend-setup)
  * [Frontend Setup](#frontend-setup)
* [Configuration](#configuration)
* [Running the Application](#running-the-application)
* [API Endpoints](#api-endpoints)
* [Design Document](#design-document)
* [License](#license)

## Features

- **Interactive Campus Map**  
  - Polygon overlays for each lot via Mapbox GL  
  - Walking‐distance routing from buildings to lots  
- **Reservations**  
  - Single‐ and group‐spot bookings with time windows  
  - Real‐time availability checks  
  - Stripe payment integration  
- **User Profiles**  
  - Editable personal info, vehicle data & permit type  
  - Current, pending & past reservation views  
- **Admin Dashboard**  
  - Approve/reject group reservations  
  - Auto‐approve single‐spot bookings  
  - User management & ticketing  


## Architecture

- **Frontend:** React, Mapbox GL JS, React DatePicker, Stripe Elements  
- **Backend:** Node.js + Express, PostgreSQL with PostGIS, Stripe Payments  
- **Hosting:**  
  - **App Server:** Heroku  
  - **Database:** Heroku Postgres (PostGIS enabled)  
- **Design Doc:** detailed wireframes, API specs, data models, and sequence diagrams  

## Prerequisites

* Node.js (v14+)
* npm or yarn
* PostgreSQL (v12+)
* PostGIS extension
* A Stripe account and API keys
* A Mapbox account and API key

## Installation

### Backend Setup

1. Clone the repo and navigate into the project root:

   ```bash
   git clone https://github.com/brandon0719/CSE416-SBU12-P4SBU.git
   cd CSE416-SBU12-P4SBU
   ```
2. Install server dependencies:

   ```bash
   cd server
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set:

   ```text
   DATABASE_URL=postgres://username:password@localhost:5432/yourdb
   STRIPE_SECRET_KEY=sk_test_...      # your Stripe secret key
   MAPBOX_KEY=pk.eyJ1Ijo...           # your Mapbox public key
   ```
4. Initialize the database:

   ```bash
   psql -d yourdb -f ./migrations/create_tables.sql
   psql -d yourdb -f ./migrations/seed_data.sql
   ```

### Frontend Setup

1. In a new terminal, navigate to the client folder:

   ```bash
   cd client
   npm install
   ```
2. Create a `.env` file in `client/`:

   ```text
   VITE_MAPBOX_KEY=pk.eyJ1Ijo...
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

## Configuration

* **Database connection:** via `DATABASE_URL` in server `.env`.
* **Stripe keys:** in server `.env` as `STRIPE_SECRET_KEY` and in client `.env` as `STRIPE_PUBLISHABLE_KEY`.
* **Mapbox key:** in client `.env` as `VITE_MAPBOX_KEY`.
* **JWT key:** in server `.env` as `JWT_SECRET`

## Running the Application

1. **Start the backend:**

   ```bash
   cd server
   npm run dev
   ```
2. **Start the frontend:**

   ```bash
   cd client
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` (or the port printed).

## API Endpoints

* **Auth:** `/api/auth/login`, `/api/auth/register`
* **Users:** `/api/user/profile`, `/api/admin/users`, `/api/admin/approveUser`
* **Lots:** `/api/lots/getlotdetails`, `/api/lots/add`, `/api/lots/edit/:id`, `/api/lots/delete/:id`
* **Reservations:** `/api/reservation/create`, `/api/reservation/user/:id`, `/api/reservation/lot/num` ...
* **Payments:** `/api/payments/create-payment-intent`
* **Tickets:** `/api/tickets/create`, `/api/tickets/user/:id`, `/api/tickets/pay`

## Design Document

For detailed design rationale, data models, wireframes, and user flows, see our design document:

[Design Document (Google Docs)](https://docs.google.com/document/d/1E8whk3lCZq_UvAOrz5guGLoqqs9F9DHRcLdPyOiF29k/edit?usp=sharing)


