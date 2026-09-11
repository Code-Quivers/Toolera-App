import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PackagesService } from "./packages.service";

// ── Platforms ────────────────────────────────────────────────────────────────

const getAllPlatforms = catchAsync(async (_req, res) => {
  const result = await PackagesService.getAllPlatforms();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Platforms fetched",
    data: result,
  });
});

const createPlatform = catchAsync(async (req, res) => {
  const platform = await PackagesService.createPlatform(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Platform created",
    data: platform,
  });
});

const updatePlatform = catchAsync(async (req, res) => {
  const platform = await PackagesService.updatePlatform(req.params.platformNameId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Platform updated",
    data: platform,
  });
});

const removePlatform = catchAsync(async (req, res) => {
  const result = await PackagesService.removePlatform(req.params.platformNameId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// ── Packages ─────────────────────────────────────────────────────────────────

const getAllPackages = catchAsync(async (req, res) => {
  const result = await PackagesService.getAllPackages(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages fetched",
    meta: result.meta,
    data: result.data,
  });
});

const getPackageById = catchAsync(async (req, res) => {
  const result = await PackagesService.getPackageById(req.params.packageId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package fetched",
    data: result,
  });
});

const getPackagesByPlatformName = catchAsync(async (req, res) => {
  const result = await PackagesService.getPackagesByPlatformName(req.params.platformName as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages fetched for platform",
    data: result,
  });
});

const createPackage = catchAsync(async (req, res) => {
  const pkg = await PackagesService.createPackage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Package created",
    data: pkg,
  });
});

const updatePackage = catchAsync(async (req, res) => {
  const pkg = await PackagesService.updatePackage(req.params.packageId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package updated",
    data: pkg,
  });
});

const removePackage = catchAsync(async (req, res) => {
  const result = await PackagesService.removePackage(req.params.packageId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// ── Subscriptions ────────────────────────────────────────────────────────────

const getSubscriptions = catchAsync(async (req, res) => {
  const result = await PackagesService.getSubscriptions(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscriptions fetched",
    meta: result.meta,
    data: result.data,
  });
});

const getRecentSubscriptions = catchAsync(async (_req, res) => {
  const result = await PackagesService.getRecentSubscriptions(10);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent subscriptions fetched",
    data: result,
  });
});

export const PackagesController = {
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  removePlatform,
  getAllPackages,
  getPackageById,
  getPackagesByPlatformName,
  createPackage,
  updatePackage,
  removePackage,
  getSubscriptions,
  getRecentSubscriptions,
};
