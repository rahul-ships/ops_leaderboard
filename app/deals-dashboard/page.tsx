import { readFileSync } from "fs";
import { join } from "path";
import { AuthGuard } from "@/components/auth-guard";
import DealsDashboardClient from "./dashboard-client";

// Always fetch fresh data to show latest bookings
export const revalidate = 0;

export default async function DealsDashboardPage() {
  const filePath = join(process.cwd(), "data", "deals-dashboard.json");
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  return (
    <AuthGuard>
      <DealsDashboardClient initialData={data} />
    </AuthGuard>
  );
}
