"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Activity, CheckCircle, Clock3, CreditCard, 
  Package, TrendingUp, ArrowRight, History 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    pendingCount: 0,
    monthlyRevenue: 0,
    activeBookings: 0,
    totalResources: 0,
  });
  
  const [actionNeededBookings, setActionNeededBookings] = useState<any[]>([]);
  const [successHistory, setSuccessHistory] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const { count: resourceCount, error: resourceError } = await supabase
          .from("resources")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
          
        if (resourceError) throw resourceError;

        const { data: bookings, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            resources!inner (id, name, category, user_id),
            profiles (full_name) 
          `)
          .eq("resources.user_id", user.id) 
          .order("created_at", { ascending: false });

        if (bookingError) throw bookingError;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let revenue = 0;
        let active = 0;
        
        const pendingArray: any[] = [];
        const historyArray: any[] = [];

        (bookings || []).forEach((b) => {
          const startDate = new Date(b.start_date);
          const endDate = new Date(b.end_date);
          const status = b.status?.toLowerCase() || "";

          if (status === "paid" || status === "pending") {
            pendingArray.push(b);
          } else if (status === "confirmed" || status === "completed") {
            historyArray.push(b);
          }

          if ((status === "confirmed" || status === "completed") && startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
            revenue += b.total_price || 0;
          }
          if ((status === "confirmed") && now >= startDate && now <= endDate) {
            active += 1;
          }
        });

        setMetrics({
          pendingCount: pendingArray.length,
          monthlyRevenue: revenue,
          activeBookings: active,
          totalResources: resourceCount || 0,
        });

        setActionNeededBookings(pendingArray.slice(0, 5));
        setSuccessHistory(historyArray.slice(0, 5));
        
      } catch (error) {
        console.error("Gagal menarik data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, supabase]);

  const handleUpdateStatus = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    const isConfirm = window.confirm(`Apakah Anda yakin ingin ${newStatus === "confirmed" ? "MENERIMA" : "MENOLAK"} pesanan ini?`);
    if (!isConfirm) return;

    try {
      const targetBooking = actionNeededBookings.find(b => b.id === bookingId);
      setActionNeededBookings((prev) => prev.filter((b) => b.id !== bookingId));
      
      if (newStatus === "confirmed") {
         setMetrics((prev) => ({ ...prev, activeBookings: prev.activeBookings + 1, pendingCount: Math.max(0, prev.pendingCount - 1) }));
         if (targetBooking) {
            setSuccessHistory(prev => [{...targetBooking, status: "confirmed"}, ...prev].slice(0, 5));
         }
      } else {
         setMetrics((prev) => ({ ...prev, pendingCount: Math.max(0, prev.pendingCount - 1) }));
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Terjadi kesalahan saat memproses pesanan.");
      window.location.reload();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Memuat Dasbor...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Vendor Dashboard</h1>
          <p className="text-slate-500">Selamat datang kembali! Berikut adalah ringkasan bisnis Anda hari ini.</p>
        </div>
        <Link 
          href="/booking" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b3b84] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
        >
          Lihat Semua Pesanan <ArrowRight className="w-4 h-4"/>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bulan ini
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pendapatan</p>
            <h3 className="text-2xl font-black text-slate-900">
              Rp {metrics.monthlyRevenue.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
              <Clock3 className="w-6 h-6" />
            </div>
            {metrics.pendingCount > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Menunggu Konfirmasi</p>
            <h3 className="text-2xl font-black text-slate-900">{metrics.pendingCount} Pesanan</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pesanan Sedang Berjalan</p>
            <h3 className="text-2xl font-black text-slate-900">{metrics.activeBookings} Pesanan</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Katalog Barang</p>
            <h3 className="text-2xl font-black text-slate-900">{metrics.totalResources} Item</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Butuh Tindakan Cepat</h2>
            <p className="text-sm text-slate-500 mt-1">Pesanan baru yang menunggu persetujuan Anda.</p>
          </div>

          <div className="overflow-x-auto flex-1">
            {actionNeededBookings.length === 0 ? (
              <div className="p-10 h-full flex flex-col items-center justify-center text-center text-slate-500">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-bold text-slate-900">Semua tugas selesai!</p>
                <p className="text-sm mt-1">Tidak ada pesanan yang menunggu konfirmasi.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-50">
                  {actionNeededBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{booking.resources?.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Oleh: {booking.profiles?.full_name || "Guest"}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-right">
                        Rp {booking.total_price?.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col gap-1.5 items-end">
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                            className="w-20 py-1 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-xs rounded transition"
                          >
                            Terima
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                            className="w-20 py-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded transition"
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Transaksi Berhasil
            </h2>
            <p className="text-sm text-slate-500 mt-1">Daftar barang Anda yang paling baru disewa.</p>
          </div>

          <div className="overflow-x-auto flex-1">
            {successHistory.length === 0 ? (
              <div className="p-10 h-full flex flex-col items-center justify-center text-center text-slate-500">
                <p className="text-sm">Belum ada riwayat transaksi yang berhasil bulan ini.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-50">
                  {successHistory.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{booking.resources?.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Disewa oleh <span className="font-medium text-slate-700">{booking.profiles?.full_name || "Guest"}</span>
                        </p>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(booking.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Sukses
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;