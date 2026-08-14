"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  MapPin,
  Receipt,
  X,
  XCircle,
  Loader2, 
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const MyBookingPage = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const [isChatLoading, setIsChatLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            resources ( id, name, category, image_urls, user_id ) 
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
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin membatalkan pesanan ini?",
    );
    if (!isConfirmed) return;

    try {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
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

  const handleChatVendor = async () => {
    if (!selectedBooking?.resources?.user_id) {
      alert("Data vendor tidak ditemukan.");
      return;
    }

    setIsChatLoading(true);
    try {
      const vendorId = selectedBooking.resources.user_id;
      
      const { data: vendorData, error } = await supabase
        .from("profiles")
        .select("phone_number, full_name")
        .eq("id", vendorId)
        .single();

      if (error) throw error;

      if (!vendorData?.phone_number) {
        alert("Maaf, vendor ini belum mencantumkan nomor WhatsApp.");
        return;
      }

      let phone = vendorData.phone_number.replace(/\D/g, "");
      if (phone.startsWith("0")) {
        phone = "62" + phone.substring(1);
      } else if (!phone.startsWith("62")) {
        phone = "62" + phone;
      }

      const bookingIdShort = `#BK-${selectedBooking.id.split("-")[0].toUpperCase()}`;
      const message = encodeURIComponent(
        `Halo ${vendorData.full_name}, saya adalah penyewa untuk pesanan ${bookingIdShort} ("${selectedBooking.resources.name}"). Saya ingin bertanya mengenai pesanan saya.`
      );

      const waUrl = `https://wa.me/${phone}?text=${message}`;
      window.open(waUrl, "_blank");

    } catch (error) {
      console.error("Gagal mendapatkan kontak vendor:", error);
      alert("Terjadi kesalahan sistem saat mencoba menghubungi vendor.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const now = new Date();

  const upcomingBookings = bookings.filter((b) => {
    const endDate = new Date(b.end_date);
    return (
      endDate >= now && b.status !== "completed" && b.status !== "cancelled"
    );
  });

  const pastBookings = bookings.filter((b) => {
    const endDate = new Date(b.end_date);
    return (
      endDate < now || b.status === "completed" || b.status === "cancelled"
    );
  });

  const displayedBookings =
    activeTab === "upcoming" ? upcomingBookings : pastBookings;

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">
          Memuat tiket Anda...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Bookings
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Manage your upcoming reservations or review past stays. All times
              are displayed in the local timezone.
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
              <p className="text-slate-500 mb-4">
                Tidak ada pesanan di kategori ini.
              </p>
              <Link
                href="/explore"
                className="text-blue-600 font-bold hover:underline"
              >
                Cari ruangan/barang sekarang
              </Link>
            </div>
          ) : (
            displayedBookings.map((booking) => {
              const startDate = new Date(booking.start_date);
              const endDate = new Date(booking.end_date);
              const resourceImg =
                booking.resources?.image_urls?.[0] ||
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400";

              return (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
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
                          {booking.resources?.name ||
                            "Resource Tidak Ditemukan"}
                        </h2>

                        <div className="shrink-0 mt-1">
                          {booking.status === "confirmed" ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                              <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                            </span>
                          ) : booking.status === "paid" ||
                            booking.status === "pending" ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                              <Clock3 className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                              <XCircle className="w-3.5 h-3.5" />{" "}
                              {booking.status === "cancelled"
                                ? "Cancelled"
                                : "Completed"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            {startDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>
                            {startDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -
                            {endDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>
                            Kategori: {booking.resources?.category || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-5 py-2.5 bg-[#0b3b84] text-white text-sm font-bold rounded-lg hover:bg-blue-900 transition"
                      >
                        View Details
                      </button>

                      {(booking.status === "paid" ||
                        booking.status === "pending") && (
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

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>

          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0b3b84] p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-200" /> E-Ticket
                </h3>
                <p className="text-blue-200 text-sm mt-1 font-mono">
                  #BK-{selectedBooking.id.split("-")[0].toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 items-center mb-6 pb-6 border-b border-slate-100">
                <img
                  src={
                    selectedBooking.resources?.image_urls?.[0] ||
                    "https://images.unsplash.com/photo-1497366216548-37526070297c"
                  }
                  alt="thumbnail"
                  className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900">
                    {selectedBooking.resources?.name}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {selectedBooking.resources?.category}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Jadwal Sewa
                  </p>
                  <p className="font-medium text-slate-800 text-sm">
                    {new Date(selectedBooking.start_date).toLocaleString(
                      "id-ID",
                      { dateStyle: "long", timeStyle: "short" },
                    )}{" "}
                    <br />
                    <span className="text-slate-400">s/d</span> <br />
                    {new Date(selectedBooking.end_date).toLocaleString(
                      "id-ID",
                      { dateStyle: "long", timeStyle: "short" },
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Pembayaran
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    Rp {selectedBooking.total_price?.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      Hubungi Vendor
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      Tersedia via WhatsApp
                    </p>
                  </div>
                </div>
                
                <button
                  disabled={isChatLoading}
                  onClick={handleChatVendor}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#20bd5a] disabled:bg-green-400 transition shadow-sm"
                >
                  {isChatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Chat"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingPage;