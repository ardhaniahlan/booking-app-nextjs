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
import { use, useState } from "react";


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
      router.push(`/auth/login?next=/explore/${resourceId}`);
      return;
    }

    console.log("1. Tombol ditekan. Memulai proses...");
    console.log("Data booking saat ini:", booking);

    try {
      let startTimestamp, endTimestamp;
      const { startDate, endDate, startTime, endTime, isHourly, isDaily, orderQuantity, grandTotal } = booking;

      if (isHourly || booking.isSessionBased) {
        startTimestamp = new Date(`${startDate}T${startTime.toString().padStart(2, '0')}:00:00`).toISOString();
        endTimestamp = new Date(`${startDate}T${endTime.toString().padStart(2, '0')}:00:00`).toISOString();
      } else if (isDaily) {
        startTimestamp = new Date(`${startDate}T14:00:00`).toISOString();
        endTimestamp = new Date(`${endDate}T12:00:00`).toISOString();
      }

      console.log("2. Timestamp berhasil dibuat:", { startTimestamp, endTimestamp });

      console.log("3. Mengirim data ke Supabase...");
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

      if (error) {
        console.error("ERROR DARI SUPABASE:", error);
        throw error;
      }

      console.log("4. Berhasil masuk database! ID Booking:", bookingData.id);

      console.log("5. Mengarahkan ke halaman checkout...");
      router.push(`/checkout/${bookingData.id}`);

    } catch (error: any) {
      console.error("GAGAL TOTAL:", error.message || error);
      alert(`Gagal: ${error.message || "Terjadi kesalahan sistem"}`);
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
    </div>
  );
};

export default ResourceDetailPage;