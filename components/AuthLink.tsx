import Link from "next/link";

interface Props {
  mode: "login" | "signup";
}

export default function AuthRedirectMessage({ mode }: Props) {
  const isLogin = mode === "login";

  return (
    <p className="text-center text-sm text-gray-600 mt-4">
      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
      <Link
        href={isLogin ? "/auth/register" : "/auth/login"}
        className="text-blue-600 hover:underline font-medium"
      >
        {isLogin ? "Sign Up" : "Sign In"}
      </Link>
    </p>
  );
}
