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
    <div className="min-h-screen w-full bg-[#FAF8F5] text-brand-charcoal flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-blush rounded-full blur-3xl opacity-60 pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FCEADE] rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
        {/* Left Column: Brand Showcase & Value Pillars (Desktop) */}
        <div className="lg:col-span-6 space-y-8 py-4 sm:py-8">
          <div>
            {/* Monogram & Title */}
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md">
                A
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal tracking-wide font-medium">
                  Adorn by Mashfika
                </h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-brand-primary font-semibold">
                  Elegance in Every Detail
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blush border border-brand-primary/20 text-brand-primary text-xs tracking-wider uppercase font-semibold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-champagne" />
              ADMIN PORTAL
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal leading-[1.18] tracking-tight">
              Manage Your Boutique <br />
              <span className="italic font-serif text-brand-primary">
                with Confidence
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 font-light leading-relaxed max-w-xl">
              Your all-in-one administration center to manage curated jewelry, accessories, inventory levels, customer orders, and sales performance.
            </p>
          </div>

          {/* 2x2 Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-brand-border/80 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-blush text-brand-primary flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-xs text-brand-charcoal">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-brand-primary hover:text-brand-primary-hover hover:underline"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>

        {/* Right Column: Floating Luxury Sign-In Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-brand-border/80 shadow-xl relative backdrop-blur-xs space-y-6">
            {/* Header in card */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-blush text-brand-primary flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl text-brand-charcoal pt-2">
                Welcome Back
              </h2>
              <p className="text-xs text-zinc-500 font-light">
                Sign in to access your boutique admin portal.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@adornbymashfika.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border bg-brand-ivory/30 text-brand-charcoal text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-brand-border bg-brand-ivory/30 text-brand-charcoal text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-charcoal transition-colors cursor-pointer"
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Notice */}
            <div className="pt-4 border-t border-brand-border/60 text-center">
              <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 font-light">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Protected by encrypted Supabase authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
