import express from "express";
import { EmployeesController } from "./employees.controller";

const router = express.Router();

router.get("/stats", EmployeesController.getStats);
router.get("/", EmployeesController.getAll);
router.post("/", EmployeesController.create);
router.patch("/:adminId/status", EmployeesController.updateStatus);
router.patch("/:adminId/role", EmployeesController.updateRole);
router.delete("/:adminId", EmployeesController.remove);

export const EmployeesRoutes = router;
