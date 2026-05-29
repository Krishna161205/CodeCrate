"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, ShieldCheck, User, Mail, Compass, Building, Sparkles, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Settings form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Enroll state
  const [enrollBio, setEnrollBio] = useState("");
  const [enrollCompanyName, setEnrollCompanyName] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const isSeller = session?.user?.role === "SELLER";

  useEffect(() => {
    if (session) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      // Default mock values if profiles not loaded yet
      setBio("Senior developer specialized in AI agents refactoring workflows.");
      setCompanyName("DevScale Labs");
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Mock save to trigger session refresh
      await update({
        name,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollLoading(true);
    setEnrollError(null);

    try {
      const res = await fetch("/api/seller/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: enrollBio, companyName: enrollCompanyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed.");
      }

      // Update NextAuth active session role to SELLER immediately in-browser!
      await update({
        role: "SELLER",
      });

      // Redirect to fresh seller dashboard
      router.push("/seller");
    } catch (err: any) {
      setEnrollError(err.message || "Failed to complete creator enrollment.");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-md">
        <div className="max-w-md text-center glass glass-shine p-lg rounded-2xl space-y-md">
          <Settings className="w-12 h-12 text-secondary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-on-surface">Settings Restricted</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please authenticate to manage your developer credentials and apply for creator status.
          </p>
          <Link
            href="/auth"
            className="w-full bg-gradient-to-r from-secondary to-tertiary text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer"
          >
            Authenticate Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Header */}
      <section>
        <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
          Account Config
        </span>
        <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
          Settings
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Configure your developer credentials, company information, and creator enrollments.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left Column: Account Details Form */}
        <div className="lg:col-span-2 space-y-lg">
          <form onSubmit={handleSaveProfile} className="glass glass-shine rounded-2xl p-lg space-y-lg shadow-xl">
            <div className="flex items-center gap-xs text-on-surface font-semibold border-b border-white/5 pb-sm">
              <Settings className="w-5 h-5 text-secondary shrink-0" />
              <span>Developer Profile Settings</span>
            </div>

            {success && (
              <div className="p-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                Changes saved successfully!
              </div>
            )}

            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Name */}
                <div className="space-y-xs">
                  <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
                    <User className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-xs text-on-surface focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div className="space-y-xs">
                  <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative bg-surface-container/45 border border-white/5 rounded-lg opacity-60">
                    <Mail className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-xs text-on-surface focus:ring-0 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40 leading-relaxed font-sans"
                />
              </div>

              {/* Company */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                  Company / Agency Studio Name
                </label>
                <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
                  <Building className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-xs text-on-surface focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary to-tertiary hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg active:scale-98 transition-all shadow-lg flex items-center justify-center gap-xs cursor-pointer text-xs font-sans"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Become Creator enrollment block */}
        <div className="lg:col-span-1">
          {isSeller ? (
            <div className="glass glass-shine rounded-2xl p-lg space-y-md shadow-xl text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Verified Creator Status</h4>
                <p className="text-[11px] text-on-surface-variant opacity-85 mt-2 leading-relaxed">
                  Your creator profile is fully integrated! You have active listing privileges on the CodeCrate Prompt Marketplace. Use your Seller Panel in the side menu to list new prompt assets.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnrollCreator} className="glass glass-shine rounded-2xl p-lg space-y-md shadow-xl">
              <div className="text-center pb-xs border-b border-white/5">
                <Sparkles className="w-8 h-8 text-tertiary mx-auto mb-xs animate-pulse" />
                <h4 className="text-sm font-bold text-on-surface">Become a Creator</h4>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Earn royalties by selling pre-validated prompt templates.
                </p>
              </div>

              {enrollError && (
                <div className="p-xs bg-error-container/10 border border-error/20 rounded text-error text-[10px]">
                  {enrollError}
                </div>
              )}

              <div className="space-y-sm">
                <div className="space-y-xs">
                  <label className="text-[10px] font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                    Creator Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollCompanyName}
                    onChange={(e) => setEnrollCompanyName(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-lg px-sm py-1.5 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                    placeholder="e.g. Model scale Labs"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-[10px] font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                    Creator Biography
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={enrollBio}
                    onChange={(e) => setEnrollBio(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-lg px-sm py-1.5 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40 leading-relaxed font-sans"
                    placeholder="Describe your engineering fields..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enrollLoading}
                className="w-full bg-gradient-to-r from-secondary via-tertiary to-on-tertiary-container hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg active:scale-98 transition-all shadow-lg flex items-center justify-center gap-xs cursor-pointer text-xs font-sans"
              >
                {enrollLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Apply for Seller Status</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
