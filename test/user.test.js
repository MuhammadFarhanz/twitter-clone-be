import supertest from "supertest";
import { app } from "../src/application/app.js";
import {
  createTestUser,
  createUserAndGenerateTestToken,
  removeTestUser,
} from "./test-util.js";

describe("POST /api/users", () => {
  afterEach(async () => {
    await removeTestUser();
  });

  it("should can register new user", async () => {
    const result = await supertest(app).post("/api/users").send({
      username: "test",
      email: "secret@gmail.com",
      password: "test1",
      name: "test",
    });

    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.password).toBeUndefined();
  });

  it("should reject if request invalid", async () => {
    const result = await supertest(app).post("/api/users").send({
      username: "",
      email: "",
      password: "",
      name: "",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if username already registered", async () => {
    let result = await supertest(app).post("/api/users").send({
      username: "test",
      email: "secret@gmail.com",
      password: "test1",
      name: "test",
    });

    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.password).toBeUndefined();

    result = await supertest(app).post("/api/users").send({
      username: "test",
      password: "secret",
      name: "test",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await createTestUser();
  });

  afterEach(async () => {
    await removeTestUser();
  });
  it("should can login", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "test",
      password: "secret",
    });

    expect(result.status).toBe(200);
  });

  it("should can reject if request invalid", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "",
      password: "",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should can reject if password wrong", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "test",
      password: "wrong",
    });

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });

  it("should can reject if username wrong", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "wrong",
      password: "wrong",
    });

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/users/current", () => {
  // beforeEach(async () => {
  //   await createTestUser();
  // });

  afterEach(async () => {
    await removeTestUser();
  });

  it("should can get user", async () => {
    const { token } = await createUserAndGenerateTestToken();

    const result = await supertest(app)
      .get("/api/users/current")
      .set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.name).toBe("test");
  });

  it("should can reject if token invalid", async () => {
    const { token } = await createUserAndGenerateTestToken();

    const result = await supertest(app)
      .get("/api/users/current")
      .set("Authorization", `Bearer ${token}1`);

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});
