import { Router } from "express";
import { ToolsController } from "./tools.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ToolsValidation } from "./tools.validation";

const router = Router();

router.get("/", ToolsController.getAll);
router.get("/:toolId", ToolsController.getById);
router.post("/", validateRequest(ToolsValidation.createTool), ToolsController.create);
router.patch("/:toolId", validateRequest(ToolsValidation.updateTool), ToolsController.update);
router.delete("/:toolId", ToolsController.remove);

router.get("/:toolId/variants", ToolsController.getVariants);
router.post("/:toolId/variants", validateRequest(ToolsValidation.createVariant), ToolsController.createVariant);
router.patch("/variants/:variantId", validateRequest(ToolsValidation.updateVariant), ToolsController.updateVariant);
router.delete("/variants/:variantId", ToolsController.removeVariant);

export const ToolsRoutes = router;
