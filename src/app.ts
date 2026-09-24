import express from "express";
import { pool } from "./db.js";
import { redis } from "./redis.js";
import { emailQueue } from "./queue.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ReachInbox Email Scheduler API is running",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "PostgreSQL connection failed",
    });
  }
});

app.get("/redis-test", async (req, res) => {
  try {
    await redis.set("test", "ReachInbox Redis Working");

    const value = await redis.get("test");

    res.json({
      message: "Redis connection successful",
      value,
    });
  } catch (error) {
    console.error("Redis connection error:", error);

    res.status(500).json({
      message: "Redis connection failed",
    });
  }
});
app.get("/queue-test", async (req, res) => {
  try {
    const job = await emailQueue.add("test-email", {
      to: "test@example.com",
      subject: "ReachInbox Test Email",
      body: "This is a BullMQ test job.",
    });

    res.json({
      message: "Job added to BullMQ",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Queue error:", error);

    res.status(500).json({
      message: "Failed to add job",
    });
  }
});
app.post("/emails", async (req, res) => {
  try {
    const {
      sender,
      recipient,
      subject,
      body,
      scheduled_at,
    } = req.body;

    // 1. Save email in PostgreSQL
    const result = await pool.query(
      `INSERT INTO emails
       (sender, recipient, subject, body, scheduled_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        sender,
        recipient,
        subject,
        body,
        scheduled_at,
      ]
    );

    const email = result.rows[0];

    // 2. Calculate delay until scheduled time
    const scheduledTime = new Date(scheduled_at).getTime();
    const delay = Math.max(0, scheduledTime - Date.now());

    // 3. Add delayed job to BullMQ
    const job = await emailQueue.add(
      "send-email",
      {
        emailId: email.id,
        sender: email.sender,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      },
      {
        delay,
        jobId: `email-${email.id}`,
      }
    );

    res.status(201).json({
      message: "Email scheduled successfully",
      email,
      jobId: job.id,
      delay,
    });
  } catch (error) {
    console.error("Email scheduling error:", error);

    res.status(500).json({
      message: "Failed to schedule email",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});