const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path, options) {
  return fetch(`${baseUrl}${path}`, options);
}

test("registration endpoints support CRUD, validation, and filters", async (t) => {
  await t.test("lists the initial registrations", async () => {
    const response = await request("/api/registrations");
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.length, 3);
    assert.deepEqual(
      body.map(({ id, ticketCount }) => ({ id, ticketCount })),
      [
        { id: 501, ticketCount: 2 },
        { id: 502, ticketCount: 1 },
        { id: 503, ticketCount: 3 },
      ],
    );
    assert.deepEqual(body[0], {
      id: 501,
      participantName: "Riya Sharma",
      eventName: "Tech Fest",
      department: "CSE",
      ticketCount: 2,
      paymentStatus: "Paid",
    });
  });

  await t.test("creates a registration and rejects invalid input", async () => {
    const payload = {
      participantName: "Karan Singh",
      eventName: "AI Workshop",
      department: "CSE",
      ticketCount: 2,
      paymentStatus: "Pending",
    };
    const createdResponse = await request("/api/registrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, id: 9876 }),
    });
    const created = await createdResponse.json();
    assert.equal(createdResponse.status, 201);
    assert.equal(created.id, 504);
    assert.deepEqual(
      Object.fromEntries(Object.entries(created).filter(([key]) => key !== "id")),
      payload,
    );

    const invalidResponse = await request("/api/registrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, ticketCount: 0 }),
    });
    assert.equal(invalidResponse.status, 400);
    assert.ok((await invalidResponse.json()).error);

    const malformedResponse = await request("/api/registrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid",
    });
    assert.equal(malformedResponse.status, 400);
    assert.ok((await malformedResponse.json()).error);
  });

  await t.test("gets a registration and returns 404 for an unknown ID", async () => {
    const response = await request("/api/registrations/501");
    assert.equal(response.status, 200);
    assert.equal((await response.json()).participantName, "Riya Sharma");

    const missingResponse = await request("/api/registrations/999");
    assert.equal(missingResponse.status, 404);
  });

  await t.test("updates a registration and rejects invalid values", async () => {
    const payload = {
      participantName: "Riya Sharma",
      eventName: "Tech Fest",
      department: "CSE",
      ticketCount: 3,
      paymentStatus: "Paid",
    };
    const response = await request("/api/registrations/501", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, id: 9876 }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 501, ...payload });

    const invalidResponse = await request("/api/registrations/501", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, paymentStatus: "Unpaid" }),
    });
    assert.equal(invalidResponse.status, 400);

    const missingResponse = await request("/api/registrations/999", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(missingResponse.status, 404);
  });

  await t.test("filters departments case-insensitively and lists pending registrations", async () => {
    const filteredResponse = await request("/api/registrations/filter?department=cSe");
    assert.equal(filteredResponse.status, 200);
    assert.deepEqual(
      (await filteredResponse.json()).map((registration) => registration.id),
      [501, 504],
    );

    const noMatchesResponse = await request("/api/registrations/filter?department=EEE");
    assert.equal(noMatchesResponse.status, 200);
    assert.deepEqual(await noMatchesResponse.json(), []);

    const pendingResponse = await request("/api/registrations/pending");
    assert.equal(pendingResponse.status, 200);
    assert.ok(
      (await pendingResponse.json()).every(
        (registration) => registration.paymentStatus === "Pending",
      ),
    );

    const missingDepartmentResponse = await request("/api/registrations/filter");
    assert.equal(missingDepartmentResponse.status, 400);
  });

  await t.test("deletes a registration and returns 404 for a missing ID", async () => {
    const response = await request("/api/registrations/504", { method: "DELETE" });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).registration.id, 504);

    const missingResponse = await request("/api/registrations/504", {
      method: "DELETE",
    });
    assert.equal(missingResponse.status, 404);
  });
});
