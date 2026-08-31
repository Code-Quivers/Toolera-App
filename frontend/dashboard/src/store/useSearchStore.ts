"use client";
import { useState } from "react";

export function useSearchStore() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  return { isOpen, query, open: () => setIsOpen(true), close: () => setIsOpen(false), setQuery };
}
