"use client";

import React, { useEffect, useState } from "react";
import { useCmsStore, DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/cms/useCmsStore";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

export function HomePageClient() {
  const { publishedSections } = useCmsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections =
    publishedSections && publishedSections.length > 0
      ? publishedSections
      : DEFAULT_HOMEPAGE_SECTIONS;

  return <SectionRenderer sections={sections} />;
}
