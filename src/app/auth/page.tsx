"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Terminal } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "register") {
        // Register API call
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create account.");
        }

        // Auto sign in upon successful registration
        const authRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (authRes?.error) {
          throw new Error(authRes.error);
        }

        router.push("/vault");
      } else {
        // Login flow
        const authRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (authRes?.error) {
          throw new Error(authRes.error || "Failed to authenticate.");
        }

        router.push("/vault");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative p-md overflow-hidden">
      {/* Ambient glowing radial effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary-container glow-accent -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-on-tertiary-container glow-accent translate-x-1/2 translate-y-1/2 rounded-full pointer-events-none"></div>

      {/* Main Glass Auth Card */}
      <div className="relative z-10 w-full max-w-md glass glass-shine rounded-2xl p-lg shadow-2xl">
        {/* Logo and branding */}
        <div className="text-center mb-lg">
          <div className="inline-flex items-center gap-xs text-primary font-bold text-2xl tracking-tight mb-xs">
            <Terminal className="w-6 h-6 text-secondary" />
            <span>CodeCrate</span>
          </div>
          <p className="text-on-surface-variant text-xs opacity-75">
            The standard for pre-validated AI instructions.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-white/10 mb-lg relative">
          <button
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`flex-1 py-sm text-sm font-semibold tracking-wide transition-colors ${
              activeTab === "login" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`flex-1 py-sm text-sm font-semibold tracking-wide transition-colors ${
              activeTab === "register" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Account
          </button>

          {/* Underglow slider */}
          <div
            className={`absolute bottom-0 h-0.5 bg-gradient-to-r from-secondary to-tertiary shadow-[0_0_12px_rgba(173,198,255,0.8)] transition-all duration-300 ${
              activeTab === "login" ? "left-0 w-1/2" : "left-1/2 w-1/2"
            }`}
          ></div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-md p-sm bg-error-container/10 border border-error/20 rounded-lg text-error text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {activeTab === "register" && (
            <div className="space-y-xs">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                Profile Name
              </label>
              <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
                <User className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-sm text-on-surface focus:ring-0 focus:outline-none"
                  placeholder="e.g. Alex Chen"
                />
              </div>
            </div>
          )}

          <div className="space-y-xs">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
              Email Address
            </label>
            <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
              <Mail className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-sm text-on-surface focus:ring-0 focus:outline-none"
                placeholder="e.g. alex@domain.com"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
              Password Key
            </label>
            <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
              <Lock className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-sm text-on-surface focus:ring-0 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-secondary via-tertiary to-on-tertiary-container hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg active:scale-98 transition-all shadow-lg flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-on-secondary border-t-transparent rounded-full animate-spin"></span>
            ) : activeTab === "register" ? (
              "Initialize Session"
            ) : (
              "Authenticate"
            )}
          </button>
        </form>

        {/* Third Party Providers */}
        <div className="mt-lg pt-lg border-t border-white/5 text-center">
          <span className="text-xs text-on-surface-variant/60 block mb-sm">
            Or proceed with OAuth provider
          </span>
          <div className="flex gap-sm">
            <button
              onClick={() => signIn("github", { callbackUrl: "/vault" })}
              className="flex-1 bg-surface-container-high border border-white/10 hover:bg-surface-variant/30 text-on-surface py-2 rounded-lg text-sm flex items-center justify-center gap-xs font-semibold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/vault" })}
              className="flex-1 bg-surface-container-high border border-white/10 hover:bg-surface-variant/30 text-on-surface py-2 rounded-lg text-sm flex items-center justify-center gap-xs font-semibold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.646 0-8.4-3.796-8.4-8.514s3.754-8.514 8.4-8.514c2.25 0 4.13.882 5.567 2.227l3.125-3.125C18.99 1.455 15.93 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.07 0 12.48-4.966 12.48-12.24 0-.834-.07-1.425-.24-1.954H12.24z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
