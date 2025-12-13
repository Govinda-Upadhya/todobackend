import express from "express";
import { prisma } from "./lib.js";
import cors from "cors";
import client from "prom-client";
import { requestCountMiddleware } from "./metric/requestcount.js";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestCountMiddleware);

/**
 * Create Todo
 */
app.post("/backend/todo", async (req, res) => {
  try {
    const { task, status } = req.body;

    const todo = await prisma.todo.create({
      data: {
        task,
        status: status ?? false,
      },
    });

    return res.status(201).json({ todo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create todo" });
  }
});

/**
 * Get All Todos
 */
app.get("/backend/todos", async (req, res) => {
  try {
    const todos = await prisma.todo.findMany();
    return res.json({ todos });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/**
 * Get Todo by ID
 */
app.get("/backend/todo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    return res.json({ todo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch todo" });
  }
});

/**
 * Update Todo
 */
app.put("/backend/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { task, status } = req.body;

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        task,
        status,
      },
    });

    return res.json({ todo });
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(500).json({ error: "Failed to update todo" });
  }
});

/**
 * Delete Todo
 */
app.delete("/backend/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.todo.delete({
      where: { id },
    });

    return res.json({ message: "Todo deleted" });
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.get("/metrics", async (req, res) => {
  const metrics = await client.register.metrics();
  res.set("Content-Type", client.register.contentType);
  res.end(metrics);
});
app.listen(3000, () => console.log("listening..."));
