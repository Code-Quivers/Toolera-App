import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrdersService } from "./orders.service";

const getAll = catchAsync(async (req, res) => {
  const result = await OrdersService.getAll(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req, res) => {
  const order = await OrdersService.getById(req.params.orderId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched",
    data: order,
  });
});

const getItems = catchAsync(async (req, res) => {
  const items = await OrdersService.getItems(req.params.orderId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order items fetched",
    data: items,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const order = await OrdersService.updateStatus(req.params.orderId as string, req.body.status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated",
    data: order,
  });
});

const updatePaymentStatus = catchAsync(async (req, res) => {
  const order = await OrdersService.updatePaymentStatus(req.params.orderId as string, req.body.paymentStatus);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated",
    data: order,
  });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await OrdersService.getStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order stats fetched",
    data: stats,
  });
});

export const OrdersController = {
  getAll,
  getById,
  getItems,
  updateStatus,
  updatePaymentStatus,
  getStats,
};
