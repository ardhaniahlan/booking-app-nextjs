"use client"

import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();
  const handleLogout = async () => {
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