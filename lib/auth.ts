import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { getAuthDatabase } from "./auth-database";

export const auth = betterAuth({
  database: mongodbAdapter(getAuthDatabase()),
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 })],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.AUTH_EMAIL_FROM;
      if (!apiKey || !from) {
        throw new Error("Password reset email is not configured on the server.");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: "Reset your Pestora password",
          text: `Use this secure link to reset your Pestora password: ${url}\n\nIf you did not request this, you can ignore this email.`,
        }),
      });

      if (!response.ok) {
        console.error("Password reset email delivery failed:", await response.text());
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
        defaultValue: "user",
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
          const agentEmails = new Set(
            (process.env.AGENT_EMAILS ?? "")
              .split(",")
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean),
          );
          const role = adminEmails.has(email)
            ? "admin"
            : agentEmails.has(email)
              ? "agent"
              : "user";
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
