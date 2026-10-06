import AuthForm from "../../components/authForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      googleEnabled={Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      )}
    />
  );
}
