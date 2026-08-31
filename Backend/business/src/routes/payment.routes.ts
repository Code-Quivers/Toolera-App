import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { requireAdmin, optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public / Storefront routes
router.get("/settings", PaymentController.getSettings);
router.post("/bkash/create", PaymentController.initBkash);
router.post("/nagad/create", PaymentController.initNagad);
router.post("/verify-manual", PaymentController.verifyManual);

// Admin routes
router.put("/settings", requireAdmin, PaymentController.updateSettings);

export default router;
