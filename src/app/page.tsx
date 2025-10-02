import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-[#6db0fc] opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -left-4 size-96 bg-[#fcb96d] opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-[#8ace00] opacity-20 blur-[100px]" />
      <div className="absolute top-0 -right-4 size-96 bg-[#936dfc] opacity-20 blur-[100px]" />

      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-8">Pomodoro Timer</h1>
        <p className="text-xl text-white/80 mb-12">
          Boost your productivity with focused work sessions
        </p>

        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-[#6db0fc] hover:bg-[#91c4ff] text-black font-medium py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-[#8ace00] hover:bg-[#c6e783] text-black font-medium py-3 px-8 rounded-lg transition-colors inline-block border border-white/20"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
