import { ShippingOption } from "@/types";

export const FREE_SHIPPING_THRESHOLD = 2000; // ৳2,000

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "inside-dhaka",
    name: "Inside Dhaka Metro",
    cost: 70,
    estimatedDays: "1–2 Days",
  },
  {
    id: "outside-dhaka",
    name: "Outside Dhaka (All Bangladesh)",
    cost: 130,
    estimatedDays: "2–4 Days",
  },
];

// The 8 Official Administrative Divisions of Bangladesh
export const BANGLADESH_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

// Legacy alias for backwards compatibility
export const BANGLADESH_DISTRICTS = BANGLADESH_DIVISIONS;
