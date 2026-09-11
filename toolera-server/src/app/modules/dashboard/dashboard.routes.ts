import express from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/stats", DashboardController.getStats);
router.get("/recent-subscriptions", DashboardController.getRecentSubscriptions);

export const DashboardRoutes = router;
