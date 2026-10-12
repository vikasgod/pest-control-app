import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { getAuthDatabase } from "./auth-database";
import { sendSmtpEmail } from "./email";

export const auth = betterAuth({
  database: mongodbAdapter(getAuthDatabase()),
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 })],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendSmtpEmail({
          to: user.email,
          subject: "Reset your Pestquro password",
          text: `Use this secure link to reset your Pestquro password: ${url}\n\nIf you did not request this, you can ignore this email.`,
        });
      } catch (error) {
        console.error("Password reset email delivery failed:", error);
        throw new Error("Unable to send password reset email.");
      }
    },
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email.toLowerCase();
          const adminEmails = new Set(
            (process.env.ADMIN_EMAILS ?? "")
              .split(",")
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean),
          );
          const managerEmails = new Set(
            (process.env.MANAGER_EMAILS ?? "")
              .split(",")
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean),
          );
          const technicianEmails = new Set(
            (process.env.TECHNICIAN_EMAILS ?? "")
              .split(",")
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean),
          );
          const role = adminEmails.has(email)
            ? "admin"
            : managerEmails.has(email)
              ? "manager"
              : technicianEmails.has(email)
                ? "technician"
                : "customer";
          return { data: { ...user, role } };
        },
      },
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_URL
    ? [process.env.BETTER_AUTH_URL]
    : ["http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});
