"use client";

import React from "react";
import { CMSSectionItem } from "@/lib/cms/types";

interface Props {
  sections: CMSSectionItem[];
  isPreview?: boolean;
}

export function SectionRenderer({ sections, isPreview }: Props) {
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
        <span className="text-2xl">🧩</span>
        <span>No sections added yet. Drag a section from the left panel.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${isPreview ? "pointer-events-none" : ""}`}>
      {sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.position - b.position)
        .map((section) => (
          <div
            key={section.id}
            className="w-full rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500"
          >
            <span className="font-bold text-slate-700">{section.type}</span>
            {isPreview && (
              <span className="ml-2 text-slate-400">(preview)</span>
            )}
          </div>
        ))}
    </div>
  );
}
