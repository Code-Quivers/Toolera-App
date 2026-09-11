import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { ToolOrdersService } from './tool-orders.service';

const getAll = catchAsync(async (req, res) => {
  const result = await ToolOrdersService.getAll(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tool orders fetched',
    data: result.data,
    meta: { total: result.total, page: 1, limit: 50 } as any,
  });
});

const getStats = catchAsync(async (req, res) => {
  const result = await ToolOrdersService.getStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tool order stats fetched',
    data: result,
  });
});

export const ToolOrdersController = { getAll, getStats };
