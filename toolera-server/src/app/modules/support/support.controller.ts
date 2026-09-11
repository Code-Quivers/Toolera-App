import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SupportService } from "./support.service";

const getAll = catchAsync(async (req, res) => {
  const result = await SupportService.getAll(req.query as any);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Tickets fetched", data: result.data, meta: result.meta });
});

const getStats = catchAsync(async (req, res) => {
  const data = await SupportService.getStats();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Stats fetched", data });
});

const getById = catchAsync(async (req, res) => {
  const data = await SupportService.getById(req.params.ticketId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Ticket fetched", data });
});

const getReplies = catchAsync(async (req, res) => {
  const data = await SupportService.getReplies(req.params.ticketId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Replies fetched", data });
});

const create = catchAsync(async (req, res) => {
  const data = await SupportService.create(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Ticket created", data });
});

const addReply = catchAsync(async (req, res) => {
  const data = await SupportService.addReply(req.params.ticketId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Reply added", data });
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await SupportService.updateStatus(req.params.ticketId, req.body.status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Status updated", data });
});

const updatePriority = catchAsync(async (req, res) => {
  const data = await SupportService.updatePriority(req.params.ticketId, req.body.priority);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Priority updated", data });
});

const assign = catchAsync(async (req, res) => {
  const data = await SupportService.assign(req.params.ticketId, req.body.adminId ?? null);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Ticket assigned", data });
});

export const SupportController = {
  getAll, getStats, getById, getReplies, create, addReply, updateStatus, updatePriority, assign,
};
