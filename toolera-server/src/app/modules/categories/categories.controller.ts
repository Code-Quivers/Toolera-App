import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CategoriesService } from "./categories.service";

const getAll = catchAsync(async (req, res) => {
  const result = await CategoriesService.getAll(req.query.search as string | undefined);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Categories fetched", data: result.data, meta: result.stats as any });
});

const create = catchAsync(async (req, res) => {
  const cat = await CategoriesService.create(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Category created", data: cat });
});

const toggleActive = catchAsync(async (req, res) => {
  const cat = await CategoriesService.toggleActive(req.params.categoryId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category status toggled", data: cat });
});

const update = catchAsync(async (req, res) => {
  const cat = await CategoriesService.update(req.params.categoryId, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category updated", data: cat });
});

const remove = catchAsync(async (req, res) => {
  const cat = await CategoriesService.remove(req.params.categoryId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category deleted", data: cat });
});

export const CategoriesController = {
  getAll,
  create,
  toggleActive,
  update,
  remove,
};
