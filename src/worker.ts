import { Worker } from "bullmq";
import Redis from "ioredis";
import nodemailer from "nodemailer";
import { createEtherealTransport } from "./smtp.js";

const workerRedis = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

async function startWorker() {
  const transporter = await createEtherealTransport();

  console.log("SMTP transporter is ready.");

  const emailWorker = new Worker(
    "emailQueue",
    async (job) => {
      console.log("Processing email job:", job.id);
      console.log("Job data:", job.data);

      const info = await transporter.sendMail({
        from: job.data.sender,
        to: job.data.recipient,
        subject: job.data.subject,
        text: job.data.body,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log("Email sent successfully!");
      console.log("Message ID:", info.messageId);
      console.log("Preview URL:", previewUrl);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    },
    {
      connection: workerRedis,
    }
  );

  emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  emailWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
  });

  console.log("Email worker is running...");
}

startWorker().catch((error) => {
  console.error("Worker startup failed:", error);
});