import { Router } from "express";
import { CategoriesController } from "./categories.controller";

const router = Router();

router.get("/", CategoriesController.getAll);
router.post("/", CategoriesController.create);
router.patch("/:categoryId/toggle", CategoriesController.toggleActive);
router.patch("/:categoryId", CategoriesController.update);
router.delete("/:categoryId", CategoriesController.remove);

export const CategoriesRoutes = router;
