"use client";

import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();
  const handleLogout = async () => {
    router.replace("/login");
  };

  return (
    <div>
      DashboardPage Admin
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default DashboardPage;