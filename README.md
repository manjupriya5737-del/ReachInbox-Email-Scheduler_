# ReachInbox Email Scheduler

A backend email scheduling system built using TypeScript, Express.js, PostgreSQL, Redis, BullMQ, and Ethereal SMTP.

## Technologies Used

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- Ethereal SMTP
- Docker

## Implemented Features

- Express.js backend API
- PostgreSQL database connection
- Redis connection
- BullMQ email queue
- Background email worker
- Delayed email scheduling
- Email data persistence in PostgreSQL
- Ethereal SMTP email testing

## Project Structure

```text
ReachInbox-Email-Scheduler/
├── src/
│   ├── app.ts
│   ├── db.ts
│   ├── queue.ts
│   ├── redis.ts
│   ├── smtp.ts
│   └── worker.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── docker-compose.yml
