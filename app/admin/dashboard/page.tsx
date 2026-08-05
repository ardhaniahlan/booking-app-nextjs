"use client";

import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

const DashboardPage = () => {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
      <div className="mb-6">
        <p>Email: {user?.email}</p>
        <p>Nama: {user?.full_name}</p>
        <p>Role: {role}</p>
      </div>
      <button 
        onClick={handleLogout} 
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  )
}

export default DashboardPage;