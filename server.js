const express = require("express");

const app = express();
app.use(express.json());

const registrations = [
  {
    id: 501,
    participantName: "Riya Sharma",
    eventName: "Tech Fest",
    department: "CSE",
    ticketCount: 2,
    paymentStatus: "Paid",
  },
  {
    id: 502,
    participantName: "Arjun Mehta",
    eventName: "Code Sprint",
    department: "IT",
    ticketCount: 1,
    paymentStatus: "Pending",
  },
  {
    id: 503,
    participantName: "Neha Verma",
    eventName: "Tech Fest",
    department: "ECE",
    ticketCount: 3,
    paymentStatus: "Paid",
  },
];

let nextId = Math.max(...registrations.map((registration) => registration.id)) + 1;

function validateRegistration(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }

  for (const field of ["participantName", "eventName", "department"]) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return `${field} must be a non-empty string`;
    }
  }

  if (!Number.isInteger(body.ticketCount) || body.ticketCount <= 0) {
    return "ticketCount must be a positive integer";
  }

  if (!["Paid", "Pending"].includes(body.paymentStatus)) {
    return "paymentStatus must be either Paid or Pending";
  }

  return null;
}

function registrationFields(body) {
  return {
    participantName: body.participantName,
    eventName: body.eventName,
    department: body.department,
    ticketCount: body.ticketCount,
    paymentStatus: body.paymentStatus,
  };
}

function findRegistration(id) {
  if (!/^\d+$/.test(id)) {
    return undefined;
  }

  return registrations.find((registration) => registration.id === Number(id));
}

app.get("/api/registrations", (req, res) => {
  res.status(200).json(registrations);
});

app.post("/api/registrations", (req, res) => {
  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const registration = { id: nextId++, ...registrationFields(req.body) };
  registrations.push(registration);
  return res.status(201).json(registration);
});

app.get("/api/registrations/filter", (req, res) => {
  const { department } = req.query;
  if (typeof department !== "string" || department.trim() === "") {
    return res.status(400).json({ error: "department query parameter is required" });
  }

  const matches = registrations.filter(
    (registration) =>
      registration.department.toLowerCase() === department.trim().toLowerCase(),
  );
  return res.status(200).json(matches);
});

app.get("/api/registrations/pending", (req, res) => {
  const pending = registrations.filter(
    (registration) => registration.paymentStatus === "Pending",
  );
  res.status(200).json(pending);
});

app.get("/api/registrations/:id", (req, res) => {
  const registration = findRegistration(req.params.id);
  if (!registration) {
    return res.status(404).json({ error: "Registration not found" });
  }
  return res.status(200).json(registration);
});

app.put("/api/registrations/:id", (req, res) => {
  const registration = findRegistration(req.params.id);
  if (!registration) {
    return res.status(404).json({ error: "Registration not found" });
  }

  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  Object.assign(registration, registrationFields(req.body));
  return res.status(200).json(registration);
});

app.delete("/api/registrations/:id", (req, res) => {
  const index = registrations.findIndex(
    (registration) => registration.id === Number(req.params.id),
  );
  if (!/^\d+$/.test(req.params.id) || index === -1) {
    return res.status(404).json({ error: "Registration not found" });
  }

  const [deleted] = registrations.splice(index, 1);
  return res.status(200).json({
    message: "Registration deleted successfully",
    registration: deleted,
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Request body must contain valid JSON" });
  }
  return next(err);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Event Registration API listening on port ${port}`);
  });
}

module.exports = app;
