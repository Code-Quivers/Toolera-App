"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Store,
  BarChart3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { setAdminToken, setAdminUser } from "@/lib/auth";

function AuthComponent({ initialMode = "SIGNUP" }: { initialMode?: "SIGNUP" | "SIGNIN" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const { login, loginWithPin, registerMerchant, checkSession } = useAdminAuthStore();

  // Active tab strictly bound to browser URL route
  const isLoginRoute = pathname?.startsWith("/login");
  const authTab: "SIGNUP" | "SIGNIN" = isLoginRoute ? "SIGNIN" : "SIGNUP";

  // Sign In sub-mode: PASSWORD or PIN
  const [signinSubMode, setSigninSubMode] = useState<"PASSWORD" | "PIN">("PASSWORD");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Sign In fields
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [pin, setPin] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (checkSession()) {
      router.replace(redirectUrl);
    }
  }, [checkSession, redirectUrl, router]);

  // Handle PIN keyboard numpad
  useEffect(() => {
    if (authTab !== "SIGNIN" || signinSubMode !== "PIN") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleNumpadClick(e.key);
      } else if (e.key === "Backspace") {
        setPin((prev) => prev.slice(0, -1));
        setErrorMsg(null);
      } else if (e.key === "Escape") {
        setPin("");
        setErrorMsg(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authTab, signinSubMode, pin, isLoading]);

  const handleNumpadClick = (digit: string) => {
    if (isLoading || pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg(null);

    if (nextPin.length === 4) {
      setIsLoading(true);
      setTimeout(() => {
        const result = loginWithPin(nextPin);
        setIsLoading(false);
        if (result.success) {
          router.replace(redirectUrl);
        } else {
          setErrorMsg(result.message);
          setPin("");
        }
      }, 250);
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("Please accept the terms of service to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: signupEmail.trim().toLowerCase(),
          password: signupPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to create account. Please try again.");
        return;
      }

      if (data.token) setAdminToken(data.token, true);
      if (data.user) setAdminUser(data.user);

      registerMerchant(fullName.trim(), signupEmail.trim().toLowerCase(), signupPassword.trim());
      router.push("/onboarding/store");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signinEmail.trim().toLowerCase(),
          password: signinPassword,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("rm_token", data.token);
        }
      }

      const clientResult = login(signinEmail, signinPassword, rememberMe);
      if (clientResult.success) {
        router.replace(redirectUrl);
      } else {
        setErrorMsg(clientResult.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Soft Emerald & Teal Glow Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* Top Left Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8 relative z-10">
        <Link href="/" className="inline-flex items-center group">
          <img src="/logo.png" alt="Toolera" style={{width: 150, height: 150}} className="object-contain transition group-hover:opacity-80" />
        </Link>
      </div>

      {/* Main 2-Column Split Section */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-10 flex-1 flex items-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Branding, Value props & Illustration (EXACT MATCH TO SCREENSHOT) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {authTab === "SIGNUP" ? (
                  <>
                    Start Selling Online! <span className="inline-block animate-bounce">🚀</span>
                  </>
                ) : (
                  <>
                    Welcome Back! <span className="inline-block animate-wave">👋</span>
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
                {authTab === "SIGNUP"
                  ? "Sign up to launch your branded online store, manage products, and take full control of your e-commerce business."
                  : "Sign in to access your store management dashboard and take full control of your business."}
              </p>
            </div>

            {/* 3 Feature Highlights (Matching exact styling) */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008B47] flex items-center justify-center shrink-0 border border-emerald-100">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Multi-Store Management</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Manage all your orders, products, and categories from a single dashboard.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008B47] flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Secure &amp; Reliable</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Enterprise-grade authentication with protected route verification.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008B47] flex items-center justify-center shrink-0 border border-emerald-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Powerful Analytics</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Real-time sales insights, live inventory tracking, and customer logs.
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative dashboard UI preview mockup card (EXACT MATCH TO SCREENSHOT) */}
            <div className="hidden sm:block p-4 rounded-3xl bg-white/80 border border-slate-200/80 shadow-lg max-w-lg relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">cms.toolera.store/analytics</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Today Sales</span>
                  <span className="text-sm font-black text-slate-900">৳38,450</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">New Orders</span>
                  <span className="text-sm font-black text-[#008B47]">+24</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Conversion</span>
                  <span className="text-sm font-black text-slate-900">4.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Modern White Card with Floating Avatar Badge (EXACT MATCH TO SCREENSHOT) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Floating Top Center Logo Badge */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white border-2 border-emerald-100 shadow-xl rounded-2xl flex items-center justify-center px-4 py-2 z-20">
                <img src="/logo.png" alt="Toolera" className="h-8 w-auto object-contain" />
              </div>

              {/* Main White Container */}
              <div className="bg-white pt-11 pb-8 px-6 sm:px-9 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6 relative">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {authTab === "SIGNUP" ? "Create Store Account" : "Admin Access"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {authTab === "SIGNUP"
                      ? "Start your 7-day free trial. No credit card required."
                      : "Sign in with your admin credentials or quick 4-digit PIN"}
                  </p>
                </div>

                {/* Primary Mode Toggle: Create Account vs Sign In (Updates Route) */}
                <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <Link
                    href={`/signup${redirectUrl && redirectUrl !== "/admin" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                    className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      authTab === "SIGNUP"
                        ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#008B47]" />
                    <span>Create Store</span>
                  </Link>
                  <Link
                    href={`/login${redirectUrl && redirectUrl !== "/admin" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                    className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      authTab === "SIGNIN"
                        ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sign In</span>
                  </Link>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SIGN UP FORM TAB                                         */}
                {/* ======================================================== */}
                {authTab === "SIGNUP" && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block text-xs">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block text-xs">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="name@company.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block text-xs">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signupPassword}
                          onChange={(e) => {
                            setSignupPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block text-xs">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Repeat your password"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms-signup"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#008B47] focus:ring-[#008B47]"
                      />
                      <label htmlFor="terms-signup" className="text-[11px] text-slate-500 font-semibold cursor-pointer">
                        I agree to the Terms of Service &amp; Privacy Policy
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-[#008B47] hover:bg-[#007a3e] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          <>
                            <span>Create Account &amp; Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ======================================================== */}
                {/* SIGN IN FORM TAB                                         */}
                {/* ======================================================== */}
                {authTab === "SIGNIN" && (
                  <div className="space-y-5">
                    {/* Secondary Toggle: Password vs Quick PIN */}
                    <div className="flex p-1 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setSigninSubMode("PASSWORD");
                          setErrorMsg(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                          signinSubMode === "PASSWORD"
                            ? "bg-white text-slate-900 shadow-2xs font-black"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Password Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSigninSubMode("PIN");
                          setErrorMsg(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                          signinSubMode === "PIN"
                            ? "bg-white text-slate-900 shadow-2xs font-black"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <KeyRound className="w-3 h-3 text-emerald-600" />
                        <span>Quick PIN (পিন)</span>
                      </button>
                    </div>

                    {/* PIN MODE */}
                    {signinSubMode === "PIN" ? (
                      <div className="space-y-4 text-center">
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-slate-700">Enter 4-Digit Security PIN</span>
                          <p className="text-[11px] text-slate-400">Use screen numpad or keyboard (Default: 1234)</p>
                        </div>

                        {/* PIN Circles */}
                        <div className="flex justify-center items-center gap-4 py-2">
                          {[0, 1, 2, 3].map((idx) => (
                            <div
                              key={idx}
                              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                pin.length > idx
                                  ? "bg-[#008B47] ring-4 ring-emerald-100 scale-110"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Touch Numpad Grid */}
                        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
                          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleNumpadClick(num)}
                              className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-900 font-extrabold text-sm transition flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setPin("")}
                            className="h-11 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-400 font-bold text-xs transition flex items-center justify-center cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumpadClick("0")}
                            className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-900 font-extrabold text-sm transition flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={() => setPin((prev) => prev.slice(0, -1))}
                            className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition flex items-center justify-center cursor-pointer"
                          >
                            ⌫
                          </button>
                        </div>

                        {/* Quick PIN Explanation Note */}
                        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 text-[11px] text-emerald-800 text-left max-w-[260px] mx-auto space-y-0.5">
                          <span className="font-extrabold block">💡 How Quick PIN Works:</span>
                          <p className="text-slate-600 leading-relaxed">
                            Type your 4-digit code (Default PIN: <strong className="font-mono text-emerald-700">1234</strong>) via screen buttons or your keyboard for instant 1-second login without typing your password.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* PASSWORD MODE */
                      <form onSubmit={handleSignInSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="font-extrabold text-slate-700 block text-xs">
                            Admin Email / Username
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={signinEmail}
                              onChange={(e) => {
                                setSigninEmail(e.target.value);
                                if (errorMsg) setErrorMsg(null);
                              }}
                              placeholder="Enter your email or username"
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-slate-700 block text-xs">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={signinPassword}
                              onChange={(e) => {
                                setSigninPassword(e.target.value);
                                if (errorMsg) setErrorMsg(null);
                              }}
                              placeholder="Enter your password"
                              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#008B47] focus:ring-2 focus:ring-[#008B47]/10 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-[#008B47] focus:ring-[#008B47]"
                            />
                            <span className="text-[11px] font-semibold">Remember session for 7 days</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => alert("Password reset link will be sent to your registered email.")}
                            className="text-[11px] font-bold text-[#008B47] hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-[#008B47] hover:bg-[#007a3e] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isLoading ? (
                              <span>Signing In...</span>
                            ) : (
                              <>
                                <span>Sign In to Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Back to Storefront Link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <Link
                    href="/"
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1.5 transition"
                  >
                    <span>← Back to Storefront</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-5 border-t border-slate-200/80 relative z-10 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#008B47] flex items-center justify-center border border-emerald-100/80 shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-800 block text-xs">Secure Access</strong>
              <span className="text-[11px] text-slate-400">Enterprise authentication with SSL security</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#008B47] flex items-center justify-center border border-emerald-100/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-slate-800 block text-xs">Multi-Tenant Isolation</strong>
              <span className="text-[11px] text-slate-400">100% database-isolated store architecture</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Toolera Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <AuthComponent initialMode="SIGNUP" />
    </Suspense>
  );
}
