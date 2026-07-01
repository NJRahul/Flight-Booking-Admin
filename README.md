# FlightBook — Admin Dashboard

Admin-only control panel for the FlightBook flight booking platform. Built with React 18, Vite, and TailwindCSS. Requires admin credentials to log in.

**Linked repositories**
- Backend API: [Flight-Booking-Backend](https://github.com/NJRahul/Flight-Booking-Backend)
- User Frontend: [Flight-Booking-Frontend](https://github.com/NJRahul/Flight-Booking-Frontend)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Server state | TanStack React Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Real-time | Socket.io-client |
| Charts | Recharts |
| Icons | Lucide React |

---

## Features

- **Dashboard** — real-time KPIs (revenue, bookings, users, flights), recent activity feed
- **Users** — list, search, filter, view and edit user profiles
- **Bookings** — full booking overview with status filters, cancellation and refund controls
- **Flights** — create, edit, and delete flights; manage seat availability
- **Airports** — browse and manage airport records
- **Airlines** — browse and manage airline records
- **Analytics** — revenue charts, booking trends, occupancy reports (Recharts)
- **Notifications** — broadcast system-wide notifications to users
- **Real-time** — live booking and user events via Socket.io

---

## Pages

| Route | Page |
|---|---|
| `/login` | Admin Login |
| `/dashboard` | Overview / KPIs |
| `/dashboard/users` | User Management |
| `/dashboard/bookings` | Booking Management |
| `/dashboard/flights` | Flight Management |
| `/dashboard/airports` | Airport Management |
| `/dashboard/airlines` | Airline Management |
| `/dashboard/notifications` | Notification Center |
| `/dashboard/analytics` | Reports & Analytics |

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/NJRahul/Flight-Booking-Admin.git
cd Flight-Booking-Admin

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The admin dashboard will be available at `http://localhost:5174`.

> The backend must be running at `http://localhost:5000`. All `/api` requests are proxied automatically by Vite in development.

---

## Admin Credentials

| Email | Password |
|---|---|
| `admin@flightbook.com` | `Admin@1234` |

> Only accounts with `role: "admin"` can log in. Run `npm run seed` in the backend to create the admin account.

---

## Scripts

```bash
npm run dev      # Start Vite dev server (port 5174)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## License

MIT
