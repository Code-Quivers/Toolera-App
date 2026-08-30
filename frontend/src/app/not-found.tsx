import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 border border-teal-200 shadow-sm text-3xl font-black">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Page or Find Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          The product, category, or page you are looking for might have been moved or is currently out of stock.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
