import { Router } from "express";
import { SellersController } from "./sellers.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SellersValidation } from "./sellers.validation";

const router = Router();

router.get("/stats", SellersController.getStats);
router.get("/", SellersController.getAll);
router.get("/:id", SellersController.getById);
router.post("/sync/:sellerGoogleId", SellersController.syncFromCore);
router.patch("/:id/status", validateRequest(SellersValidation.updateStatus), SellersController.updateStatus);
router.delete("/mark-deleted/:sellerGoogleId", SellersController.markDeleted);
router.get("/:sellerGoogleId/subscriptions", SellersController.getSubscriptions);

export const SellersRoutes = router;
