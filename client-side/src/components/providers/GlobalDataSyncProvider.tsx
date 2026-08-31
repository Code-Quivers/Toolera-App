"use client";

import React, { useEffect, useRef } from "react";
import { fetchServerData, syncToServer } from "@/lib/serverSync";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useFooterStore } from "@/store/useFooterStore";
import { useMenuStore } from "@/store/useMenuStore";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useCouponStore } from "@/store/useCouponStore";

export function GlobalDataSyncProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Fetch live data from Server DB
    fetchServerData().then((serverData) => {
      if (!serverData) return;

      if (serverData.cms?.publishedSections) {
        useCmsStore.setState({
          draftSections: serverData.cms.draftSections || serverData.cms.publishedSections,
          publishedSections: serverData.cms.publishedSections,
          theme: serverData.cms.theme || useCmsStore.getState().theme,
        });
      }

      if (serverData.products && Array.isArray(serverData.products)) {
        useProductStore.setState({ products: serverData.products });
      }

      if (serverData.categories && Array.isArray(serverData.categories)) {
        useCategoryStore.setState({ categories: serverData.categories });
      }

      if (serverData.header) {
        useHeaderStore.setState({ settings: serverData.header });
      }

      if (serverData.footer) {
        useFooterStore.setState({ settings: serverData.footer });
      }

      if (serverData.menus && Array.isArray(serverData.menus)) {
        useMenuStore.setState({ menus: serverData.menus });
      }

      if (serverData.reviews) {
        const reviewsArr = Array.isArray(serverData.reviews)
          ? serverData.reviews
          : Array.isArray((serverData.reviews as any)?.reviews)
          ? (serverData.reviews as any).reviews
          : [];
        useReviewStore.setState({ reviews: reviewsArr });
      }

      if (serverData.customers && Array.isArray(serverData.customers)) {
        useCustomerStore.setState({ customers: serverData.customers });
      }

      if (serverData.orders && Array.isArray(serverData.orders)) {
        useOrderStore.setState({ orders: serverData.orders });
      }

      if (serverData.coupons && Array.isArray(serverData.coupons)) {
        useCouponStore.setState({ coupons: serverData.coupons });
      }
    });

    // 2. Continuous real-time subscription: sync every store action to Server DB instantly
    const unsubProduct = useProductStore.subscribe((state) => {
      syncToServer("products", state.products);
    });

    const unsubCategory = useCategoryStore.subscribe((state) => {
      syncToServer("categories", state.categories);
    });

    const unsubCms = useCmsStore.subscribe((state) => {
      syncToServer("cms", {
        draftSections: state.draftSections,
        publishedSections: state.publishedSections,
        theme: state.theme,
      });
    });

    const unsubHeader = useHeaderStore.subscribe((state) => {
      syncToServer("header", state.settings);
    });

    const unsubFooter = useFooterStore.subscribe((state) => {
      syncToServer("footer", state.settings);
    });

    const unsubMenu = useMenuStore.subscribe((state) => {
      syncToServer("menus", state.menus);
    });

    const unsubReview = useReviewStore.subscribe((state) => {
      syncToServer("reviews", state.reviews);
    });

    const unsubCustomer = useCustomerStore.subscribe((state) => {
      syncToServer("customers", state.customers);
    });

    const unsubOrder = useOrderStore.subscribe((state) => {
      syncToServer("orders", state.orders);
    });

    const unsubCoupon = useCouponStore.subscribe((state) => {
      syncToServer("coupons", state.coupons);
    });

    return () => {
      unsubProduct();
      unsubCategory();
      unsubCms();
      unsubHeader();
      unsubFooter();
      unsubMenu();
      unsubReview();
      unsubCustomer();
      unsubOrder();
      unsubCoupon();
    };
  }, []);

  return <>{children}</>;
}
