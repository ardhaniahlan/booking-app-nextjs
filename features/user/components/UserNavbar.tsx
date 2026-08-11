"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { createBrowserClient } from "@supabase/ssr";
import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Favorites", href: "/favorites" }, 
  { label: "My Bookings", href: "/mybooking" },
  { label: "Profile", href: "/profile" },
] as const;

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&facepad=2&w=256&h=256&q=80";

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, clearAuth } = useAuthStore();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearAuth?.();
      router.push("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const isActiveLink = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f8fbff] border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/explore" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a4b9c] rounded-full flex items-center justify-center shadow-sm">
              <ClipboardCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl text-[#1a4b9c] tracking-tight">
              BookingApp
            </span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    isActiveLink(link.href)
                      ? "text-[#1a4b9c] font-semibold"
                      : "text-slate-600 font-medium hover:text-[#1a4b9c]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="block w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 hover:ring-blue-400 hover:shadow-md transition-all focus:outline-none"
                  >
                    <img
                      src={(user as any)?.user_metadata?.avatar_url || FALLBACK_AVATAR}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {user?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mt-0.5">
                          {role}
                        </p>
                      </div>

                      {(role === "vendor" || role === "admin") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1a4b9c] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#1a4b9c] rounded-full hover:bg-blue-800 shadow-sm transition-colors"
                >
                  Sign In
                </Link>
                
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? "bg-blue-50 text-[#1a4b9c]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1a4b9c]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}