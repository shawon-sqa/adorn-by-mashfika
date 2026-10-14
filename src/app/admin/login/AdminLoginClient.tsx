"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Package,
  Users,
  ShieldCheck,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already logged in, redirect directly to admin
  useEffect(() => {
    async function checkExistingAuth() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push(nextUrl);
      }
    }
    checkExistingAuth();
  }, [nextUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.message?.includes("Invalid login credentials")) {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
      } else {
        setErrorMessage(err.message || "Failed to sign in. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Sales & Orders",
      desc: "Track sales and manage customer orders in real-time.",
    },
    {
      icon: Package,
      title: "Product & Inventory",
      desc: "Manage jewelry, accessories, clothing, and stock levels.",
    },
    {
      icon: Users,
      title: "Customer Management",
      desc: "View customer details, addresses, and order histories.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Administration",
      desc: "Manage your boutique with enterprise protected access.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F5] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4A373]/10 via-[#FAF7F5] to-[#FAF7F5] text-[#240610] flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-x-hidden">
      {/* Background ambient decorative shapes in champagne gold & wine */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4A373]/10 rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#4A1525]/5 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
        {/* Left Column: Brand Showcase & Value Pillars (Desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-6 space-y-6 sm:space-y-8 py-2 sm:py-8">
          <div>
            {/* Monogram & Title */}
            <div className="inline-flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#4A1525] text-[#D4A373] border border-[#D4A373]/30 font-serif text-xl sm:text-2xl font-bold flex items-center justify-center shadow-md flex-shrink-0">
                A
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#240610] tracking-wide font-medium">
                  Adorn by Mashfika
                </h1>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#D4A373] font-semibold">
                  Elegance in Every Detail
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A373]/15 border border-[#D4A373]/40 text-[#6B4B27] text-xs tracking-wider uppercase font-semibold mb-3 sm:mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              ADMIN PORTAL
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#240610] leading-[1.2] tracking-tight">
              Manage Your Boutique <br />
              <span className="italic font-serif text-[#4A1525]">
                with Confidence
              </span>
            </h2>

            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-zinc-600 font-light leading-relaxed max-w-xl">
              Your all-in-one administration center to manage curated jewelry, accessories, inventory levels, customer orders, and sales performance.
            </p>
          </div>

          {/* 2x2 Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border border-[#EAE3DE] rounded-2xl p-5 hover:border-[#D4A373]/50 hover:shadow-md transition-all shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#4A1525]/8 text-[#4A1525] border border-[#D4A373]/20 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-xs text-[#240610]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-1 sm:pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#7A6268] hover:text-[#4A1525] transition-colors"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>

        {/* Right Column: Floating Luxury Sign-In Card */}
        <div className="w-full lg:col-span-6 flex flex-col items-center justify-center mx-auto py-8 sm:py-12">
          {/* Dynamic Centered Header at the top of the login container on Mobile */}
          <div className="lg:hidden flex flex-col items-center mb-6 text-center">
            {/* Monogram & Title Row */}
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4A1525] text-[#D4A373] font-serif text-2xl font-bold flex items-center justify-center shadow-md flex-shrink-0 border-2 border-[#D4A373]/40 ring-2 ring-[#D4A373]/20">
                A
              </div>
              <div className="text-left">
                <h1 className="font-serif text-2xl font-bold text-[#240610] tracking-wide leading-tight">
                  Adorn by Mashfika
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4A373] font-semibold">
                  Elegance in Every Detail
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A373]/15 border border-[#D4A373]/40 text-[#6B4B27] text-xs tracking-wider uppercase font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              ADMIN PORTAL
            </div>
          </div>

          {/* Elevated Login Card */}
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE3DE] shadow-xl shadow-[#4A1525]/5 relative backdrop-blur-xs space-y-6">
            {/* Header in card */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#4A1525]/10 text-[#4A1525] border border-[#D4A373]/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#240610] pt-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-zinc-500 font-light">
                Sign in to access your boutique admin portal.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50/80 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D4A373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@adornbymashfika.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DDD7] bg-[#FAF7F5]/50 text-[#240610] text-xs focus:border-[#4A1525] focus:ring-2 focus:ring-[#D4A373]/20 focus:bg-white outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#D4A373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E5DDD7] bg-[#FAF7F5]/50 text-[#240610] text-xs focus:border-[#4A1525] focus:ring-2 focus:ring-[#D4A373]/20 focus:bg-white outline-none transition-all placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#4A1525] transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button with Luxury Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
                  isLoading
                    ? "bg-[#4A1525] text-[#F3E5D8] opacity-90 cursor-not-allowed shadow-lg shadow-[#4A1525]/20"
                    : "bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] shadow-lg shadow-[#4A1525]/25 hover:shadow-xl hover:shadow-[#4A1525]/35 cursor-pointer active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#D4A373] border-t-transparent animate-spin rounded-full flex-shrink-0" />
                    <span>Signing in to Admin Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Notice */}
            <div className="pt-4 border-t border-[#EAE3DE] text-center">
              <p className="text-[11px] text-[#7A6268] flex items-center justify-center gap-1.5 font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Protected by 256-bit encrypted boutique security
              </p>
            </div>
          </div>

          {/* Mobile Return to Storefront Link */}
          <div className="mt-6 text-center lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#7A6268] hover:text-[#4A1525] transition-colors"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
