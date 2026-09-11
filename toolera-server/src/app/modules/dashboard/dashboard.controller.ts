import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

const getStats = async (_req: Request, res: Response) => {
  const data = await DashboardService.getStats();
  res.json({ success: true, data });
};

const getRecentSubscriptions = async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const data = await DashboardService.getRecentSubscriptions(limit);
  res.json({ success: true, data });
};

export const DashboardController = {
  getStats,
  getRecentSubscriptions,
};
