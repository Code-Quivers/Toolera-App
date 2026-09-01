import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText, Clock, ShieldCheck, Phone } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || "";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchPage(slug: string) {
  try {
    const qs = STORE_SLUG ? `?slug=${encodeURIComponent(STORE_SLUG)}` : "";
    const res = await fetch(`${API}/api/v1/cms/pages/${encodeURIComponent(slug)}${qs}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.metaDescription || page.excerpt || "",
  };
}

export default async function DynamicCustomPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) notFound();

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <span>›</span>
          <span className="text-slate-700 font-semibold">{page.title}</span>
        </div>

        <article className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-6">
            {page.type && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {page.type}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              {page.title}
            </h1>
            {page.updatedAt && (
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Last updated:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-wrap">
            {page.content}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Genuine China Curated Products for Bangladesh</span>
            </div>
            <a href="tel:01712345678" className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline: 01712-345678</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
