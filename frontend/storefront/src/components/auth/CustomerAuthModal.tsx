"use client";

import React, { useState } from "react";
import { useCustomerAuthStore } from "@/store/useCustomerAuthStore";
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

export function CustomerAuthModal() {
  const { isAuthModalOpen, authModalView, closeAuthModal, openAuthModal, login, register } =
    useCustomerAuthStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // Register Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError("Please enter your mobile phone number or email.");
      return;
    }

    const res = login(identifier, password);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg(null);
        closeAuthModal();
      }, 1000);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    const res = register(name, email, phone, regPassword, address, district, district);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setName("");
      setPhone("");
      setEmail("");
      setRegPassword("");
      setAddress("");
      setTimeout(() => {
        setSuccessMsg(null);
        closeAuthModal();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008B47] flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">
                {authModalView === "LOGIN" ? "Customer Sign In" : "Create New Customer Account"}
              </h3>
              <p className="text-xs text-slate-400">Toolera Bangladesh</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Notice */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#008B47] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authModalView === "LOGIN" ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number or Email *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01712345678 or email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <span className="text-slate-500">Don&apos;t have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    openAuthModal("REGISTER");
                  }}
                  className="font-bold text-[#008B47] hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="01712-345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">District / City</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47] font-medium"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Set Password</label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Street / Area Address</label>
                <input
                  type="text"
                  placeholder="House, Road, Area (Optional for fast checkout)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <span className="text-slate-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    openAuthModal("LOGIN");
                  }}
                  className="font-bold text-[#008B47] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
