"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const QrisSimulationModal = ({
  isOpen,
  total,
  onSuccess,
  onCancel,
}: {
  isOpen: boolean;
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePay = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Scan QRIS</h3>
        <p className="text-sm text-slate-500 mb-6">
          Gunakan aplikasi M-Banking atau E-Wallet Anda untuk memindai kode ini.
        </p>
        
        <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 mb-6">
          <QrCode className="w-24 h-24 text-slate-400" />
        </div>

        <div className="text-2xl font-black text-blue-700 mb-8">
          Rp {total.toLocaleString("id-ID")}
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={handleSimulatePay}
            disabled={isProcessing}
            className="w-full bg-[#0a3182] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
            ) : (
              "Simulasikan Bayar Berhasil"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [showQrisModal, setShowQrisModal] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`*, resources(*)`)
          .eq("id", bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const resource = booking.resources;

  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const dateString = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const timeString = `${startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const handlePayNowClick = () => {
    if (paymentMethod === "qris") {
      setShowQrisModal(true);
    } else {
      alert("Metode pembayaran ini belum tersedia di simulasi.");
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", booking.id);

      if (error) throw error;

      setShowQrisModal(false);
      alert("Pembayaran Berhasil! Vendor akan segera memproses pesanan Anda.");
      
      router.push("/explore"); 
      
    } catch (error) {
      console.error("Gagal update pembayaran:", error);
      alert("Terjadi kesalahan saat memverifikasi pembayaran.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition">
            ← Kembali
          </button>
          <h1 className="text-3xl font-black text-slate-900">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Pilih Metode Pembayaran</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <label className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === "qris"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 border-2 rounded-2xl flex flex-col items-center gap-3 text-center transition-all border-slate-200 text-slate-500 hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                    <QrCode className="w-8 h-8" />
                    <span className="font-bold text-sm">QRIS</span>
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="payment"
                    value="va"
                    checked={paymentMethod === "va"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 border-2 rounded-2xl flex flex-col items-center gap-3 text-center transition-all border-slate-200 text-slate-500 hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                    <CreditCard className="w-8 h-8" />
                    <span className="font-bold text-sm">Virtual Account</span>
                  </div>
                </label>

                <label className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === "ewallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 border-2 rounded-2xl flex flex-col items-center gap-3 text-center transition-all border-slate-200 text-slate-500 hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                    <Wallet className="w-8 h-8" />
                    <span className="font-bold text-sm">E-Wallet</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 text-green-800 rounded-xl">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">
                  Transaksi Anda dilindungi dengan enkripsi 256-bit SSL untuk keamanan maksimal.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-100">
            <div className="bg-blue-50/50 p-6 sm:p-8 rounded-3xl border border-blue-100 sticky top-8">
              
              <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-6">
                <img 
                  src={resource?.image_urls?.[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"} 
                  alt={resource?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white font-bold text-lg leading-tight">{resource?.name}</h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jadwal Sewa</h4>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{dateString}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{timeString}</p>
                    <p className="text-sm text-slate-500">
                      {booking.quantity > 1 ? `(${booking.quantity} Unit)` : ""}
                    </p>
                  </div>
                </div>
                {resource?.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{resource.city}</p>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-blue-200/60 my-6" />

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black text-[#0a3182]">
                  Rp {booking.total_price?.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handlePayNowClick}
                className="w-full bg-[#0a3182] hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
              >
                <ShieldCheck className="w-5 h-5" />
                Bayar Sekarang
              </button>
              
              <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                Dengan menyelesaikan pembayaran ini, Anda menyetujui Syarat & Ketentuan kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      <QrisSimulationModal 
        isOpen={showQrisModal} 
        total={booking?.total_price || 0} 
        onCancel={() => setShowQrisModal(false)}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  );
}