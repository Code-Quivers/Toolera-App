import { Router } from "express";
import { SettingsController } from "./settings.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SettingsValidation } from "./settings.validation";

const router = Router();

router.get("/", SettingsController.getAll);
router.get("/:key", SettingsController.getByKey);
router.post("/", validateRequest(SettingsValidation.upsert), SettingsController.upsert);
router.delete("/:key", SettingsController.remove);

export const SettingsRoutes = router;
