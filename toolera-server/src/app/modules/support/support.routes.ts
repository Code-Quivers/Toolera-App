import { Router } from "express";
import { SupportController } from "./support.controller";

const router = Router();

router.get("/stats", SupportController.getStats);
router.get("/", SupportController.getAll);
router.post("/", SupportController.create);
router.get("/:ticketId", SupportController.getById);
router.get("/:ticketId/replies", SupportController.getReplies);
router.post("/:ticketId/replies", SupportController.addReply);
router.patch("/:ticketId/status", SupportController.updateStatus);
router.patch("/:ticketId/priority", SupportController.updatePriority);
router.patch("/:ticketId/assign", SupportController.assign);

export const SupportRoutes = router;
