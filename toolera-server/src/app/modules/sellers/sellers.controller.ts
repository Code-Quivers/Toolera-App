import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SellersService } from "./sellers.service";

const getAll = catchAsync(async (req, res) => {
  const result = await SellersService.getAll(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sellers fetched",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req, res) => {
  const seller = await SellersService.getById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller fetched",
    data: seller,
  });
});

const syncFromCore = catchAsync(async (req, res) => {
  const seller = await SellersService.syncFromCore(req.params.sellerGoogleId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller synced from core",
    data: seller,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const seller = await SellersService.updateStatus(req.params.id as string, req.body.status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller status updated",
    data: seller,
  });
});

const markDeleted = catchAsync(async (req, res) => {
  const seller = await SellersService.markDeleted(req.params.sellerGoogleId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller marked as deleted",
    data: seller,
  });
});

const getSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await SellersService.getSubscriptions(req.params.sellerGoogleId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscriptions fetched",
    data: subscriptions,
  });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await SellersService.getStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller stats fetched",
    data: stats,
  });
});

export const SellersController = {
  getAll,
  getById,
  syncFromCore,
  updateStatus,
  markDeleted,
  getSubscriptions,
  getStats,
};
