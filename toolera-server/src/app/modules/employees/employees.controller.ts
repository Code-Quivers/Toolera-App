import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EmployeesService } from "./employees.service";

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const data = await EmployeesService.getStats();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Stats fetched", data });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { search, role, status, page, limit } = req.query as Record<string, string>;
  const result = await EmployeesService.getAll({
    search,
    role,
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Employees fetched", data: result.data, meta: result.meta as any });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await EmployeesService.create(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Employee created", data });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { status } = req.body;
  const data = await EmployeesService.updateStatus(adminId, status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Status updated", data });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { role } = req.body;
  const data = await EmployeesService.updateRole(adminId, role);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Role updated", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const data = await EmployeesService.remove(adminId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Employee removed", data });
});

export const EmployeesController = { getStats, getAll, create, updateStatus, updateRole, remove };
