import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ToolsService } from "./tools.service";

const getAll = catchAsync(async (req, res) => {
  const result = await ToolsService.getAll(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tools fetched",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req, res) => {
  const tool = await ToolsService.getById(req.params.toolId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tool fetched",
    data: tool,
  });
});

const create = catchAsync(async (req, res) => {
  const tool = await ToolsService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Tool created",
    data: tool,
  });
});

const update = catchAsync(async (req, res) => {
  const tool = await ToolsService.update(req.params.toolId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tool updated",
    data: tool,
  });
});

const remove = catchAsync(async (req, res) => {
  const result = await ToolsService.remove(req.params.toolId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getVariants = catchAsync(async (req, res) => {
  const variants = await ToolsService.getVariants(req.params.toolId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Variants fetched",
    data: variants,
  });
});

const createVariant = catchAsync(async (req, res) => {
  const variant = await ToolsService.createVariant(req.params.toolId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Variant created",
    data: variant,
  });
});

const updateVariant = catchAsync(async (req, res) => {
  const variant = await ToolsService.updateVariant(req.params.variantId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Variant updated",
    data: variant,
  });
});

const removeVariant = catchAsync(async (req, res) => {
  const result = await ToolsService.removeVariant(req.params.variantId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const ToolsController = {
  getAll,
  getById,
  create,
  update,
  remove,
  getVariants,
  createVariant,
  updateVariant,
  removeVariant,
};
