import React from "react";
import { AdminResultsView } from "@/features/admin/AdminResultsView";

export const metadata = {
  title: "Class Results & Rankings - Admin Dashboard",
  description: "View student average percentage marks, class rankings, and standings filtered by class level.",
};

export default function AdminResultsPage() {
  return <AdminResultsView />;
}
