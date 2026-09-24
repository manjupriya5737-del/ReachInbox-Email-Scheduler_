import nodemailer from "nodemailer";

export async function createEtherealTransport() {
  const testAccount = await nodemailer.createTestAccount();

  console.log("Ethereal account created:");
  console.log("User:", testAccount.user);

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}