"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          key="nav-progress"
          initial={{ scaleX: 0, opacity: 0.9 }}
          animate={{ scaleX: [0, 0.65, 1], opacity: [1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ originX: 0 }}
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#008B47] via-[#10B981] to-[#F9A01B] z-[9999] pointer-events-none shadow-[0_0_10px_rgba(0,139,71,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
