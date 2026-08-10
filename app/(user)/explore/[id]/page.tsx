"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { BookingWidget } from "@/features/user/components/BookingWidget";
import { ImageCarousel } from "@/features/user/components/ImageCarousel";
import { IncompleteProfileModal } from "@/features/user/components/IncompleteBookingModal";
import { ResourceInfoCard } from "@/features/user/components/ResourceInfoCard";
import { useBookingCalculator } from "@/features/user/hooks/useBookingCalculator";
import { useResourceDetail } from "@/features/user/hooks/useResourceDetail";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";


const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600";

const ResourceDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { user } = useAuthStore();

  const { resource, isLoading } = useResourceDetail(resourceId);
  const booking = useBookingCalculator(resource);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("start_date, end_date")
          .eq("resource_id", resourceId)
          .in("status", ["paid", "confirmed"]);

        if (error) throw error;
        const datesToBlock: Date[] = [];
        
        data?.forEach((booking) => {
          let currentDate = new Date(booking.start_date);
          const endDate = new Date(booking.end_date);

          while (currentDate <= endDate) {
            datesToBlock.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        setBookedDates(datesToBlock);
      } catch (error) {
        console.error("Gagal menarik data jadwal:", error);
      }
    };

    fetchBookedDates();
  }, [resourceId]);

  const isDateOverlap = (selectedStart: Date, selectedEnd: Date) => {
    return bookedDates.some((bookedDate) => {
      return bookedDate >= selectedStart && bookedDate <= selectedEnd;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff]">
        <h2 className="text-2xl font-bold text-slate-800">Resource tidak ditemukan</h2>
        <button onClick={() => router.push("/explore")} className="mt-4 text-blue-600 underline">
          Kembali ke Explore
        </button>
      </div>
    );
  }

  const images = resource.image_urls?.length > 0 ? resource.image_urls : [FALLBACK_IMAGE];

  const handleReserve = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      return;
    }

    const { startDate, endDate } = booking;
    if (startDate && endDate) {
      const selectedStart = new Date(startDate);
      const selectedEnd = new Date(endDate);

      if (isDateOverlap(selectedStart, selectedEnd)) {
        alert("Mohon maaf, periode tanggal yang Anda pilih sudah dibooking oleh orang lain. Silakan pilih tanggal lain.");
        return; 
      }
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData?.phone_number) {
        setShowPhoneModal(true);
        return; 
      }

      let startTimestamp, endTimestamp;
      const { startDate, endDate, startTime, endTime, isHourly, isDaily, orderQuantity, grandTotal } = booking;

      if (isHourly || booking.isSessionBased) {
        startTimestamp = new Date(`${startDate}T${startTime.toString().padStart(2, '0')}:00:00`).toISOString();
        endTimestamp = new Date(`${startDate}T${endTime.toString().padStart(2, '0')}:00:00`).toISOString();
      } else if (isDaily) {
        startTimestamp = new Date(`${startDate}T14:00:00`).toISOString();
        endTimestamp = new Date(`${endDate}T12:00:00`).toISOString();
      }

      const { data: overlappingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("resource_id", resourceId)
        .in("status", ["pending", "paid", "confirmed"]) 
        .lt("start_date", endTimestamp) 
        .gt("end_date", startTimestamp);

      if (checkError) throw checkError;

      if (overlappingBookings && overlappingBookings.length > 0) {
        alert("Waduh! Jadwal ini baru saja dipesan oleh pengguna lain beberapa saat yang lalu. Silakan pilih waktu yang berbeda.");
        return; 
      }

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          start_date: startTimestamp,
          end_date: endTimestamp,
          quantity: orderQuantity || 1,
          total_price: grandTotal,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/checkout/${bookingData.id}`);

    } catch (error: any) {
      console.error("GAGAL TOTAL:", error.message || error);
      alert(`Gagal: ${error.message || "Terjadi kesalahan sistem"}`);
    }
  };

  const handleSavePhoneAndContinue = async () => {
    if (!user) return;

    if (!phoneNumber || phoneNumber.length < 9) {
      alert("Masukkan nomor WhatsApp yang valid (minimal 9 angka).");
      return;
    }

    setIsSavingPhone(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ phone_number: phoneNumber })
        .eq("id", user.id);

      if (error) throw error;

      setShowPhoneModal(false);
      await handleReserve(); 

    } catch (error) {
      console.error("Gagal menyimpan nomor HP:", error);
      alert("Gagal menyimpan nomor telepon. Silakan coba lagi.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-24">
      <ImageCarousel
        images={images}
        alt={resource.name}
        overlay={
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-blue-100/80 backdrop-blur-md text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                {resource.category || "Workspace"}
              </span>
              <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold text-slate-700">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                4.9 <span className="font-medium text-slate-500">(124 reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              {resource.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <MapPin className="w-5 h-5 text-blue-600" />
              {resource.city || "Location to be detailed"}
            </div>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ResourceInfoCard
            category={resource.category}
            description={resource.description}
            isActive={resource.is_active}
            showCapacityInfo={booking.showCapacityInfo}
            maxCapacity={booking.maxCapacity}
            showQuantityInput={booking.showQuantityInput}
            maxQuantity={booking.maxQuantity}
          />

          <div className="w-full lg:w-1/3 relative">
            <BookingWidget booking={booking} onReserve={handleReserve} />
          </div>
        </div>
      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSavingPhone && setShowPhoneModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tunggu Sebentar!</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Kami butuh nomor WhatsApp Anda agar Vendor dapat dengan mudah menghubungi Anda terkait operasional pesanan ini.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+62</span>
                  <input
                    type="tel"
                    placeholder="81234567890"
                    value={phoneNumber}
                    
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} // Hanya terima angka
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 font-medium transition"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Pastikan nomor ini aktif dan bisa dihubungi.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPhoneModal(false)}
                  disabled={isSavingPhone}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePhoneAndContinue}
                  disabled={isSavingPhone}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSavingPhone ? "Menyimpan..." : "Simpan & Lanjut"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;