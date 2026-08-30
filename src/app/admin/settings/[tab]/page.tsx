import AdminSettingsPage from "../page";

export default async function AdminSettingsTabRoute({
  params,
}: {
  params: Promise<{ tab: string }> | { tab: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  return <AdminSettingsPage initialTab={resolvedParams?.tab || "shipping"} />;
}