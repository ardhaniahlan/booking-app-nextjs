"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Archive, 
  CalendarDays, 
  ListOrdered, 
  Users 
} from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resources", href: "/resources", icon: Archive },
  { name: "All Bookings", href: "/booking", icon: ListOrdered },
  { name: "Profile", href: "/admin-profile", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  return (
    <aside className="w-64 h-screen bg-[#f8fafe] flex flex-col border-r border-slate-200">
      
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3 text-blue-700">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Admin</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col p-4">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 mb-1 font-medium text-sm transition-all rounded-xl ${
                isActive 
                  ? "bg-[#0b3c95] text-white" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden shrink-0 shadow-sm">
            <img 
              src="https://ui-avatars.com/api/?name=Ardhani+Ahlan&background=random" 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold text-slate-800 truncate">{user?.full_name || "User"}</span>
            <span className="text-xs text-slate-500">{role || "User"}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

    </aside>
  );
}