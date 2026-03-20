import { SignUp } from "@clerk/nextjs";
import { AuthBackground } from "@/components/auth-background";
import { clerkDarkAppearance } from "@/lib/clerk-appearance";

export default function SignupPage() {
  return (
    <AuthBackground>
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={clerkDarkAppearance}
      />
    </AuthBackground>
  );
}
