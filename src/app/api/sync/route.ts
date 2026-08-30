import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_THEME } from "@/lib/cms/useCmsStore";
import { defaultHeaderSettings } from "@/store/useHeaderStore";
import { defaultFooterSettings } from "@/store/useFooterStore";
import { DEFAULT_MENUS } from "@/store/useMenuStore";

const DB_DIR = path.join(process.cwd(), "src", "data", "db");

// Ensure DB directory exists
async function ensureDbDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch {}
}

// Read JSON file or return default
async function readDbFile(filename: string, fallback: any) {
  await ensureDbDir();
  const filePath = path.join(DB_DIR, filename);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

// Write JSON file
async function writeDbFile(filename: string, data: any) {
  await ensureDbDir();
  const filePath = path.join(DB_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const products = await readDbFile("products.json", []);
    const categories = await readDbFile("categories.json", []);
    const rawReviews = await readDbFile("reviews.json", []);
    const reviews = Array.isArray(rawReviews)
      ? rawReviews
      : Array.isArray(rawReviews?.reviews)
      ? rawReviews.reviews
      : [];
    const customers = await readDbFile("customers.json", []);
    const orders = await readDbFile("orders.json", []);
    const coupons = await readDbFile("coupons.json", []);

    const cms = await readDbFile("cms.json", {
      draftSections: DEFAULT_HOMEPAGE_SECTIONS,
      publishedSections: DEFAULT_HOMEPAGE_SECTIONS,
      theme: DEFAULT_THEME,
    });

    const header = await readDbFile("header.json", defaultHeaderSettings);
    const footer = await readDbFile("footer.json", defaultFooterSettings);
    const menus = await readDbFile("menus.json", DEFAULT_MENUS);
    const attributes = await readDbFile("attributes.json", []);

    return NextResponse.json({
      success: true,
      data: {
        products,
        categories,
        reviews,
        customers,
        orders,
        coupons,
        cms,
        header,
        footer,
        menus,
        attributes,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || data === undefined) {
      return NextResponse.json({ success: false, error: "Missing type or data" }, { status: 400 });
    }

    switch (type) {
      case "products":
        await writeDbFile("products.json", data);
        break;
      case "categories":
        await writeDbFile("categories.json", data);
        break;
      case "reviews":
        const reviewList = Array.isArray(data)
          ? data
          : Array.isArray(data?.reviews)
          ? data.reviews
          : [];
        await writeDbFile("reviews.json", reviewList);
        break;
      case "customers":
        await writeDbFile("customers.json", data);
        break;
      case "orders":
        await writeDbFile("orders.json", data);
        break;
      case "coupons":
        await writeDbFile("coupons.json", data);
        break;
      case "cms":
        await writeDbFile("cms.json", data);
        break;
      case "header":
        await writeDbFile("header.json", data);
        break;
      case "footer":
        await writeDbFile("footer.json", data);
        break;
      case "menus":
        await writeDbFile("menus.json", data);
        break;
      case "attributes":
        await writeDbFile("attributes.json", data);
        break;
      case "adminAuth":
      case "adminProfile":
        await writeDbFile("admin.json", data);
        break;
      case "adminNotifications":
        await writeDbFile("notifications.json", data);
        break;
      case "shippingSettings":
        await writeDbFile("shipping.json", data);
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
