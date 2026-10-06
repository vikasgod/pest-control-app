import AuthForm from "../../components/authForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AuthForm mode="reset-password" resetToken={token ?? ""} />;
}
