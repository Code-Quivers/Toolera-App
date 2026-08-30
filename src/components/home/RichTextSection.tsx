import React from "react";

interface RichTextProps {
  settings?: {
    heading: string;
    content: string;
    alignment?: "left" | "center";
  };
}

export function RichTextSection({ settings }: RichTextProps) {
  const heading = settings?.heading || "About Our Curated Collection";
  const content = settings?.content || "We test and hand-select China trending gadgets and home essentials before bringing them to Bangladesh.";
  const alignment = settings?.alignment || "center";

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className={`space-y-3 ${alignment === "center" ? "text-center" : "text-left"}`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}
