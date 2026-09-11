import { Router } from "express";
import { OrdersController } from "./orders.controller";
import validateRequest from "../../middlewares/validateRequest";
import { OrdersValidation } from "./orders.validation";

const router = Router();

router.get("/stats", OrdersController.getStats);
router.get("/", OrdersController.getAll);
router.get("/:orderId", OrdersController.getById);
router.get("/:orderId/items", OrdersController.getItems);
router.patch("/:orderId/status", validateRequest(OrdersValidation.updateStatus), OrdersController.updateStatus);
router.patch("/:orderId/payment-status", validateRequest(OrdersValidation.updatePaymentStatus), OrdersController.updatePaymentStatus);

export const OrdersRoutes = router;
