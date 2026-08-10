"use client"

import { useAuthStore } from "@/features/auth/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { createBrowserClient } from "@supabase/ssr";
import { CalendarX, CheckCircle, ChevronLeft, ChevronRight, Clock, Filter, MoreVertical, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};


const BookingPage = () => {
const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("All");

  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            resources!inner ( name, category, image_urls, user_id ),
            profiles ( full_name )
          `)
          .eq("resources.user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("ERROR SUPABASE DETAIL:", error);
          throw error;
        }
        
        console.log("Data Booking Mentah:", data);
        setBookings(data || []);
      } catch (error) {
        console.error("Gagal mengambil data pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, supabase]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;
    } catch (error) {
      console.error("Gagal update status:", error);
      toast.error("Gagal memperbarui status. Memuat ulang data...");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.resources?.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      booking.profiles?.full_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter.toLowerCase();

    let matchesDate = true;
    const bookingDate = new Date(booking.start_date);
    
    if (startDateFilter) {
      const start = new Date(startDateFilter);
      start.setHours(0, 0, 0, 0);
      if (bookingDate < start) matchesDate = false;
    }
    
    if (endDateFilter) {
      const end = new Date(endDateFilter);
      end.setHours(23, 59, 59, 999);
      if (bookingDate > end) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalBookings = bookings.length;
  const pendingApprovals = bookings.filter((b) => b.status === "paid" || b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Memuat Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">All Bookings</h1>
          <p className="text-slate-500 text-sm">Manage and track reservations across all your resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Total Bookings</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-blue-900">{totalBookings}</span>
            </div>
          </div>

          <div className="bg-[#8b6118] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-yellow-900/10">
            <h3 className="text-xs font-bold text-white/70 tracking-wider mb-4 uppercase">Pending Approvals</h3>
            <div className="text-3xl font-black">{pendingApprovals}</div>
            <Clock className="absolute right-4 bottom-4 w-12 h-12 text-white/10" />
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-red-500 tracking-wider mb-4 uppercase">Cancelled (MTD)</h3>
            <div className="text-3xl font-black text-red-900">{cancelledBookings}</div>
            <CalendarX className="absolute right-4 bottom-4 w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Guest, Resource, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 text-sm outline-none text-blackn"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto pr-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="paid">Pending/Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-4 py-2.5 font-medium rounded-xl text-sm border flex items-center gap-2 transition-colors ${
                  startDateFilter || endDateFilter 
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Filter className="w-4 h-4" /> 
                {startDateFilter && endDateFilter 
                  ? "Filtered" 
                  : startDateFilter ? "From " + startDateFilter 
                  : endDateFilter ? "Until " + endDateFilter 
                  : "Date Range"}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-3 p-5 bg-white border border-slate-100 shadow-2xl rounded-2xl z-20 w-72 animate-in fade-in slide-in-from-top-2">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mulai Tanggal</label>
                    <input 
                      type="date" 
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sampai Tanggal</label>
                    <input 
                      type="date" 
                      min={startDateFilter}
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }}
                      className="text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      Reset Filter
                    </button>
                    <button 
                      onClick={() => setShowDatePicker(false)}
                      className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-5 whitespace-nowrap">Booking ID</th>
                  <th className="px-6 py-5">Resource</th>
                  <th className="px-6 py-5">Guest</th>
                  <th className="px-6 py-5 whitespace-nowrap">Date & Time</th>
                  <th className="px-6 py-5 text-right">Amount</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada data pesanan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => {
                    const resourceImg = booking.resources.image_urls?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=100";
                    const startDate = new Date(booking.start_date);
                    const endDate = new Date(booking.end_date);
                    
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-500">
                            #BK-{booking.id.slice(0, 6).toUpperCase()}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={resourceImg} alt="resource" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{booking.resources.name}</div>
                              <div className="text-xs text-slate-500">{booking.resources.category}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(booking.profiles?.full_name)}
                            </div>
                            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                              {booking.profiles?.full_name || "Unknown Guest"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-700">
                            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                            {startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - 
                            {endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900 text-sm">
                            Rp {booking.total_price?.toLocaleString("id-ID")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {booking.status === "paid" || booking.status === "pending" ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pending</span>
                            ) : booking.status === "confirmed" ? (
                              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm shadow-blue-600/30">Confirmed</span>
                            ) : booking.status === "completed" ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>
                            ) : (
                              <span className="px-3 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-full">Cancelled</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            {(booking.status === "paid" || booking.status === "pending") && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                  title="Terima Pesanan"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                  title="Tolak Pesanan"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}

                            {booking.status === "confirmed" && (
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, "completed")}
                                className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-600 hover:text-white transition"
                              >
                                Mark Complete
                              </button>
                            )}
                            
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition ml-2">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <span className="text-sm text-slate-500 font-medium">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredBookings.length,
                )}{" "}
                of {filteredBookings.length} entries
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BookingPage;