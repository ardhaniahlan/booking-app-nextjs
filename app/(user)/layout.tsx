import UserNavbar from "@/features/user/components/UserNavbar";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function UserLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <UserNavbar />
      <main className="mt-6">{children}</main>
    </div>
  );
}