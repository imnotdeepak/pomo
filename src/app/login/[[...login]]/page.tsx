import { SignIn } from "@clerk/nextjs";
import { AuthBackground } from "@/components/auth-background";
import { clerkDarkAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <AuthBackground>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        forceRedirectUrl="/dashboard"
        appearance={clerkDarkAppearance}
      />
    </AuthBackground>
  );
}
