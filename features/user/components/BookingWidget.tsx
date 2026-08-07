import { ChevronRight } from "lucide-react";
import { useBookingCalculator } from "../hooks/useBookingCalculator";
import { SessionBookingForm } from "./SessionBookingForm";
import { HourlyBookingForm } from "./HourlyBookingForm";
import { DailyBookingForm } from "./DailyBookingForm";

interface BookingWidgetProps {
  booking: ReturnType<typeof useBookingCalculator>;
  onReserve: () => void;
}

export const BookingWidget = ({ booking, onReserve }: BookingWidgetProps) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    orderQuantity,
    setOrderQuantity,
    basePrice,
    unitLabel,
    isHourly,
    isDaily,
    isSessionBased,
    maxQuantity,
    showQuantityInput,
    duration,
    effectiveDuration,
    grandTotal,
    isDateComplete,
    canReserve,
  } = booking;

  return (
    <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl lg:text-4xl font-black text-slate-900">
            Rp {basePrice.toLocaleString("id-ID")}
          </span>
          <span className="text-slate-500 font-medium">/ {unitLabel}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {isSessionBased && (
          <SessionBookingForm
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
          />
        )}

        {isHourly && (
          <HourlyBookingForm
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />
        )}

        {isDaily && (
          <DailyBookingForm
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        )}

        {showQuantityInput && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Jumlah Unit
            </label>
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700"
            />
          </div>
        )}
      </div>

      <hr className="border-slate-100 my-6" />

      {duration > 0 && (
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>
              Rp {basePrice.toLocaleString("id-ID")} × {effectiveDuration} {unitLabel}
              {showQuantityInput ? ` × ${orderQuantity} unit` : ""}
            </span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 border-t border-slate-100 pt-4">
        <span className="text-lg font-bold text-slate-900">Total Bayar</span>
        <span className="text-2xl font-black text-blue-700">
          Rp {grandTotal.toLocaleString("id-ID")}
        </span>
      </div>

      <button
        onClick={onReserve}
        disabled={!canReserve}
        className="w-full bg-[#0a3182] hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
      >
        {!isDateComplete ? "Pilih Jadwal Dulu" : "Reserve Now"}
        <ChevronRight className="w-5 h-5" />
      </button>
      <p className="text-center text-xs text-slate-400 mt-4">Belum ada biaya yang dipotong</p>
    </div>
  );
}