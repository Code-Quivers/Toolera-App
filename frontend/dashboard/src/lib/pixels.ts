"use client";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const PixelEvents = {
  /**
   * Track general PageView
   */
  pageView: (url?: string) => {
    if (typeof window === "undefined") return;

    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "PageView");
    }

    // TikTok Pixel
    if (window.ttq && typeof window.ttq.page === "function") {
      window.ttq.page();
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_location: url || window.location.href,
        page_path: window.location.pathname,
      });
    }
  },

  /**
   * Track Product View (ViewContent)
   */
  viewContent: (product: {
    id: string;
    title: string;
    price: number;
    category?: string;
  }) => {
    if (typeof window === "undefined") return;

    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "BDT",
      });
    }

    // TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("ViewContent", {
        content_id: product.id,
        content_type: "product",
        content_name: product.title,
        value: product.price,
        currency: "BDT",
      });
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", "view_item", {
        currency: "BDT",
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category,
            price: product.price,
          },
        ],
      });
    }
  },

  /**
   * Track AddToCart
   */
  addToCart: (product: {
    id: string;
    title: string;
    price: number;
    quantity?: number;
    category?: string;
  }) => {
    if (typeof window === "undefined") return;
    const qty = product.quantity || 1;
    const totalVal = product.price * qty;

    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: totalVal,
        currency: "BDT",
      });
    }

    // TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("AddToCart", {
        content_id: product.id,
        content_type: "product",
        content_name: product.title,
        quantity: qty,
        value: totalVal,
        currency: "BDT",
      });
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", "add_to_cart", {
        currency: "BDT",
        value: totalVal,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category,
            price: product.price,
            quantity: qty,
          },
        ],
      });
    }
  },

  /**
   * Track InitiateCheckout
   */
  initiateCheckout: (cartItems: Array<{ id: string; title: string; price: number; quantity: number }>, total: number) => {
    if (typeof window === "undefined") return;

    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_ids: cartItems.map((it) => it.id),
        num_items: cartItems.reduce((acc, it) => acc + it.quantity, 0),
        value: total,
        currency: "BDT",
      });
    }

    // TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("InitiateCheckout", {
        contents: cartItems.map((it) => ({
          content_id: it.id,
          content_name: it.title,
          quantity: it.quantity,
          price: it.price,
        })),
        value: total,
        currency: "BDT",
      });
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", "begin_checkout", {
        currency: "BDT",
        value: total,
        items: cartItems.map((it) => ({
          item_id: it.id,
          item_name: it.title,
          price: it.price,
          quantity: it.quantity,
        })),
      });
    }
  },

  /**
   * Track Purchase
   */
  purchase: (order: {
    orderNumber: string;
    total: number;
    items: Array<{ id: string; productTitle?: string; title?: string; price: number; quantity?: number; qty?: number }>;
  }) => {
    if (typeof window === "undefined") return;

    // Meta Pixel
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        content_ids: order.items.map((it) => it.id),
        content_type: "product",
        value: order.total,
        currency: "BDT",
        order_id: order.orderNumber,
      });
    }

    // TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("CompletePayment", {
        content_id: order.orderNumber,
        value: order.total,
        currency: "BDT",
      });
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: order.orderNumber,
        value: order.total,
        currency: "BDT",
        items: order.items.map((it) => ({
          item_id: it.id,
          item_name: it.productTitle || it.title || "Product",
          price: it.price,
          quantity: it.quantity || it.qty || 1,
        })),
      });
    }
  },
};
