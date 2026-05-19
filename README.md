# Gym Membership and Session Booking System

A REST API built with Node.js, Express, and SQLite (better-sqlite3).

## Setup

```bash
cd gym-system
npm install
npm run seed       # initializes the DB schema and inserts sample data
npm start          # starts the server on port 3000
```

For development with auto-reload:
```bash
npm run dev
```

## Default Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@gym.com     | admin123   |
| Staff | staff@gym.com     | staff123   |

---

## API Endpoints

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint         | Description       | Auth |
|--------|------------------|-------------------|------|
| POST   | /api/auth/login  | Staff login → JWT | No   |

### Members (staff/admin)
| Method | Endpoint             | Description      |
|--------|----------------------|------------------|
| GET    | /api/members         | List members     |
| GET    | /api/members/:id     | Get one member   |
| POST   | /api/members         | Create member    |
| PUT    | /api/members/:id     | Update member    |
| DELETE | /api/members/:id     | Delete member    |

### Membership Plans (admin only for write)
| Method | Endpoint        | Description    |
|--------|-----------------|----------------|
| GET    | /api/plans      | List plans     |
| POST   | /api/plans      | Create plan    |
| PUT    | /api/plans/:id  | Update plan    |
| DELETE | /api/plans/:id  | Delete plan    |

### Memberships (staff/admin)
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /api/members/:id/memberships      | Member's memberships    |
| POST   | /api/members/:id/memberships      | Assign plan to member   |
| PUT    | /api/memberships/:id/renew        | Renew a membership      |

### Sessions (staff/admin for write, all authenticated for read)
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| GET    | /api/sessions         | Upcoming sessions|
| GET    | /api/sessions/:id     | Get one session  |
| POST   | /api/sessions         | Create session   |
| PUT    | /api/sessions/:id     | Update session   |
| DELETE | /api/sessions/:id     | Delete session   |

### Bookings (staff/admin)
| Method | Endpoint                       | Description        |
|--------|--------------------------------|--------------------|
| GET    | /api/members/:id/bookings      | Member's bookings  |
| POST   | /api/bookings                  | Create booking     |
| PUT    | /api/bookings/:id/cancel       | Cancel booking     |

### Attendance (staff/admin)
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/attendance                   | Mark attendance          |
| GET    | /api/sessions/:id/attendance      | Session attendance list  |

### Reports (staff/admin)
| Method | Endpoint                      | Description             |
|--------|-------------------------------|-------------------------|
| GET    | /api/reports/memberships      | Membership status count |
| GET    | /api/reports/sessions         | Session utilization     |

---

## Example curl Commands

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gym.com","password":"admin123"}'

# Set token (replace with actual token from login response)
TOKEN="your_jwt_token_here"

# List members
curl http://localhost:3000/api/members -H "Authorization: Bearer $TOKEN"

# Create a booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"member_id":1,"session_id":1}'

# Mark attendance
curl -X POST http://localhost:3000/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"status":"present"}'

# Renew membership
curl -X PUT http://localhost:3000/api/memberships/1/renew \
  -H "Authorization: Bearer $TOKEN"

# Session utilization report
curl http://localhost:3000/api/reports/sessions -H "Authorization: Bearer $TOKEN"
```

---

## Running Tests

```bash
npm test
```

Tests cover all 8 business rules using an in-memory SQLite database.

---

## Business Rules Enforced

1. Member can only book if their membership is currently active.
2. Member cannot book the same session more than once.
3. Session cannot be booked beyond its capacity.
4. Cannot book a session whose date/time has already passed.
5. Expired memberships are auto-updated on every status check.
6. Only staff/admin can create, edit, or delete sessions and plans.
7. Membership renewal calculates end_date from today, not the original start_date.
8. Attendance can only be recorded for sessions that have already occurred.
