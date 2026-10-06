import AuthForm from "../../components/authForm";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthForm
      mode="register"
      googleEnabled={Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      )}
    />
  );
}
