import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ToolsRoutes } from "../modules/tools/tools.routes";
import { SellersRoutes } from "../modules/sellers/sellers.routes";
import { OrdersRoutes } from "../modules/orders/orders.routes";
import { SettingsRoutes } from "../modules/settings/settings.routes";
import { PackagesRoutes } from "../modules/packages/packages.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { CategoriesRoutes } from "../modules/categories/categories.routes";
import { SupportRoutes } from "../modules/support/support.routes";
import { EmployeesRoutes } from "../modules/employees/employees.routes";
import { LogsRoutes } from "../modules/logs/logs.routes";
import { ToolOrdersRoutes } from "../modules/tool-orders/tool-orders.routes";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/tools", route: ToolsRoutes },
  { path: "/sellers", route: SellersRoutes },
  { path: "/orders", route: OrdersRoutes },
  { path: "/settings", route: SettingsRoutes },
  { path: "/packages", route: PackagesRoutes },
  { path: "/dashboard", route: DashboardRoutes },
  { path: "/categories", route: CategoriesRoutes },
  { path: "/support-tickets", route: SupportRoutes },
  { path: "/employees", route: EmployeesRoutes },
  { path: "/logs", route: LogsRoutes },
  { path: "/tool-orders", route: ToolOrdersRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
