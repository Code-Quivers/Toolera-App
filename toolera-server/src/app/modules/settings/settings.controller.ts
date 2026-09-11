import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SettingsService } from "./settings.service";

const getAll = catchAsync(async (req, res) => {
  const settings = await SettingsService.getAll();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Settings fetched",
    data: settings,
  });
});

const getByKey = catchAsync(async (req, res) => {
  const setting = await SettingsService.getByKey(req.params.key as string);
  if (!setting) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Setting not found",
      data: null,
    });
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting fetched",
    data: setting,
  });
});

const upsert = catchAsync(async (req, res) => {
  const { key, value, description } = req.body;
  const setting = await SettingsService.upsert(key, value, description);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting upserted",
    data: setting,
  });
});

const remove = catchAsync(async (req, res) => {
  const result = await SettingsService.remove(req.params.key as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const SettingsController = {
  getAll,
  getByKey,
  upsert,
  remove,
};
