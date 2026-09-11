import { Router } from "express";
import { PackagesController } from "./packages.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PackagesValidation } from "./packages.validation";

const router = Router();

// ── Platform routes ──────────────────────────────────────────────────────────
router.get("/platforms", PackagesController.getAllPlatforms);
router.post("/platforms", validateRequest(PackagesValidation.createPlatform), PackagesController.createPlatform);
router.patch("/platforms/:platformNameId", validateRequest(PackagesValidation.updatePlatform), PackagesController.updatePlatform);
router.delete("/platforms/:platformNameId", PackagesController.removePlatform);

// ── Package routes ───────────────────────────────────────────────────────────
router.get("/", PackagesController.getAllPackages);
router.get("/by-platform/:platformName", PackagesController.getPackagesByPlatformName);
router.get("/:packageId", PackagesController.getPackageById);
router.post("/", validateRequest(PackagesValidation.createPackage), PackagesController.createPackage);
router.patch("/:packageId", validateRequest(PackagesValidation.updatePackage), PackagesController.updatePackage);
router.delete("/:packageId", PackagesController.removePackage);

// ── Subscription routes ──────────────────────────────────────────────────────
router.get("/subscriptions/list", PackagesController.getSubscriptions);
router.get("/subscriptions/recent", PackagesController.getRecentSubscriptions);

export const PackagesRoutes = router;
