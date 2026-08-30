"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export const fadeInVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.985 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
