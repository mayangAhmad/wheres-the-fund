import Link from "next/link";

interface Props {
  mode: "login" | "signup";
  currentRole?: "donor" | "ngo"; // 1. Add this optional prop
}

export default function AuthLink({ mode, currentRole }: Props) {
  const isLogin = mode === "login";

  // 2. Determine the base destination
  const basePath = isLogin ? "/auth/register" : "/auth/login";

  // 3. Append the role query param if it exists
  // Result: "/auth/register?role=ngo" or just "/auth/register"
  const href = currentRole 
    ? `${basePath}?role=${currentRole}` 
    : basePath;

  return (
    <p className="text-center text-sm text-gray-600 mt-4">
      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
      <Link
        href={href}
        className="text-blue-600 hover:underline font-medium"
      >
        {isLogin ? "Sign Up" : "Sign In"}
      </Link>
    </p>
  );
}