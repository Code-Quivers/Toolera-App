import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";
import { authRateLimiter } from "../../middlewares/rateLimit";

const router = Router();

router.post("/login", authRateLimiter, validateRequest(AuthValidation.login), AuthController.login);
router.get("/profile", AuthController.getProfile);
router.patch("/change-password", validateRequest(AuthValidation.changePassword), AuthController.changePassword);
router.post("/create", validateRequest(AuthValidation.createAdmin), AuthController.createAdmin);

export const AuthRoutes = router;
