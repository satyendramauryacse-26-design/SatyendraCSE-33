# Event Registration Management API

A Node.js and Express REST API that stores college event registrations in an
in-memory array. The initial registrations are seeded in `server.js`; changes
are lost when the server restarts.

## Run

```sh
npm install
npm start
```

The API listens on port `3000` by default. Set the `PORT` environment variable
to use another port.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/registrations` | List all registrations |
| `POST` | `/api/registrations` | Create a registration |
| `GET` | `/api/registrations/:id` | Get a registration by ID |
| `PUT` | `/api/registrations/:id` | Replace a registration's fields |
| `DELETE` | `/api/registrations/:id` | Delete a registration |
| `GET` | `/api/registrations/filter?department=CSE` | Filter by department (case-insensitive) |
| `GET` | `/api/registrations/pending` | List registrations with pending payment |

POST and PUT require `participantName`, `eventName`, and `department` as
non-empty strings, `ticketCount` as a positive integer, and `paymentStatus` as
exactly `Paid` or `Pending`. Invalid request bodies return HTTP 400; unknown
registration IDs return HTTP 404.

Run the API integration tests with:

```sh
npm test
```
