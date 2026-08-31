import AdminSettingsPage from "../page";

export default async function AdminSettingsTabRoute({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  return <AdminSettingsPage initialTab={tab || "shipping"} />;
}