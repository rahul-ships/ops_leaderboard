import { AuthGuard } from "@/components/auth-guard";
import { parseCSVData } from "@/lib/csv-parser";
import DashboardClient from "./page-client";

export default async function Page() {
  // Fetch data on the server - no API call visible to client
  const data = await parseCSVData();

  return (
    <AuthGuard>
      <DashboardClient initialData={data} />
    </AuthGuard>
  );
}
