"use client"

import { useAuthStore } from "@/features/auth/store/authStore";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, Clock3, MapPin, XCircle } from "lucide-react";
import Link from "next/link";

const MyBookingPage = () => {
    const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            resources ( id, name, category, image_urls )
          `)
          .eq("user_id", user.id) 
          .order("start_date", { ascending: true });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error("Gagal mengambil data pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBookings();
  }, [user, supabase]);

  const handleCancelBooking = async (bookingId: string) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?");
    if (!isConfirmed) return;

    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
    } catch (error) {
      console.error("Gagal membatalkan:", error);
      alert("Gagal membatalkan pesanan.");
    }
  };

  const now = new Date();
  
  const upcomingBookings = bookings.filter((b) => {
    const endDate = new Date(b.end_date);
    return endDate >= now && b.status !== "completed" && b.status !== "cancelled";
  });

  const pastBookings = bookings.filter((b) => {
    const endDate = new Date(b.end_date);
    return endDate < now || b.status === "completed" || b.status === "cancelled";
  });

  const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Memuat tiket Anda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Manage your upcoming reservations or review past stays. All times are displayed in the local timezone.
            </p>
          </div>

          <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
                activeTab === "upcoming" 
                  ? "bg-[#0b3b84] text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
                activeTab === "past" 
                  ? "bg-[#0b3b84] text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              Past ({pastBookings.length})
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {displayedBookings.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-slate-500 mb-4">Tidak ada pesanan di kategori ini.</p>
              <Link href="/explore" className="text-blue-600 font-bold hover:underline">
                Cari ruangan/barang sekarang
              </Link>
            </div>
          ) : (
            displayedBookings.map((booking) => {
              const startDate = new Date(booking.start_date);
              const endDate = new Date(booking.end_date);
              const resourceImg = booking.resources?.image_urls?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400";

              return (
                <div key={booking.id} className="flex flex-col md:flex-row bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  
                  <div className="w-full md:w-72 h-48 md:h-auto shrink-0 relative">
                    <img 
                      src={resourceImg} 
                      alt={booking.resources?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">
                          {booking.resources?.name || "Resource Tidak Ditemukan"}
                        </h2>
                        
                        <div className="shrink-0 mt-1">
                          {booking.status === "confirmed" ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                              <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                            </span>
                          ) : booking.status === "paid" || booking.status === "pending" ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                              <Clock3 className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                              <XCircle className="w-3.5 h-3.5" /> {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{startDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>
                            {startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - 
                            {endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Kategori: {booking.resources?.category || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                      <button className="px-5 py-2.5 bg-[#0b3b84] text-white text-sm font-bold rounded-lg hover:bg-blue-900 transition">
                        View Details
                      </button>
                      
                      {(booking.status === "paid" || booking.status === "pending") && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2.5 text-[#0b3b84] font-bold text-sm hover:underline transition"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookingPage;