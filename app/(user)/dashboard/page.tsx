"use client"

import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <div>
      DashboardPage User
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default DashboardPage;