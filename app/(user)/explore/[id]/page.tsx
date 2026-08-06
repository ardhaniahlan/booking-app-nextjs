"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Loader2,
  MapPin,
  Monitor,
  Package,
  Star,
  Users,
  Video,
  Wifi,
  Wind,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const ResourceDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const router = useRouter();

  const resolvedParams = use(params);
  const resourceId = resolvedParams.id;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [resource, setResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select(
            `
            *,
            profiles(full_name)
          `,
          )
          .eq("id", resourceId)
          .single();

        if (error) throw error;
        setResource(data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [resourceId, supabase]);

  const images =
    resource?.image_urls?.length > 0
      ? resource.image_urls
      : [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600",
        ];

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const [addCatering, setAddCatering] = useState(false);
  const [addTechSupport, setAddTechSupport] = useState(false);

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
        <h2 className="text-2xl font-bold text-slate-800">
          Resource tidak ditemukan
        </h2>
        <button
          onClick={() => router.push("/explore")}
          className="mt-4 text-blue-600 underline"
        >
          Kembali ke Explore
        </button>
      </div>
    );
  }

  const basePrice = resource.price || 0;
  const unit = resource.price_unit || "day";
  const duration = 4;
  const subTotal = basePrice * duration;
  const addonsTotal = (addCatering ? 40 : 0) + (addTechSupport ? 25.83 : 0);
  const grandTotal = subTotal + addonsTotal;

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-24">
      <div className="relative h-[60vh] min-h-100 w-full bg-slate-900 group">
        <img
          src={images[currentImageIndex]}
          alt={resource.name}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#f8fbff] via-transparent to-black/20"></div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-800 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-800 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-100/80 backdrop-blur-md text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
              {resource.category || "Workspace"}
            </span>
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold text-slate-700">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              4.9{" "}
              <span className="font-medium text-slate-500">(124 reviews)</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
            {resource.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location to be detailed
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              About this {resource.category || "space"}
            </h2>

            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {resource.description ||
                "Tidak ada deskripsi spesifik untuk layanan ini."}
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="grid grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-6">
                {resource.capacity && resource.capacity > 0 ? (
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    Kapasitas: {resource.capacity} Orang
                  </div>
                ) : null}

                {(resource.category === "Equipment" ||
                  resource.category === "Service") &&
                resource.quantity ? (
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Package className="w-5 h-5" />
                    </div>
                    Stok Tersedia: {resource.quantity} Unit
                  </div>
                ) : null}

                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  Status:{" "}
                  {resource.is_active
                    ? "Tersedia untuk disewa"
                    : "Sedang tidak tersedia"}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 relative">
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-slate-500 font-medium">/ {unit}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                  />
                </div>
              </div>

              <hr className="border-slate-100 my-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-slate-900">
                  Total Sementara
                </span>
                <span className="text-2xl font-black text-slate-900">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              <button className="w-full bg-[#0a3182] hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg">
                Reserve Now
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
