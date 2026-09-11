import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      admin: result.admin,
      accessToken: result.accessToken,
    },
  });
});

const getProfile = catchAsync(async (req, res) => {
  const adminId = (req as any).user?.adminId;
  const admin = await AuthService.getProfile(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched",
    data: admin,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const adminId = (req as any).user?.adminId;
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(adminId, currentPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { email, password, name, role } = req.body;
  const admin = await AuthService.createAdmin(email, password, name, role);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin created",
    data: admin,
  });
});

export const AuthController = {
  login,
  getProfile,
  changePassword,
  createAdmin,
};
