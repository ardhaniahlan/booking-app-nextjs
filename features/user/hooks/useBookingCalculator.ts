import { useState } from "react";

type PriceUnit = "hour" | "day" | "session";

export function useBookingCalculator(resource: any) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(""); // dipakai mode daily
  const [startTime, setStartTime] = useState(""); // dipakai mode hourly & session
  const [endTime, setEndTime] = useState(""); // dipakai mode hourly
  const [orderQuantity, setOrderQuantity] = useState(1);

  const basePrice: number = resource?.price || 0;
  const unit: PriceUnit = (resource?.price_unit || "day") as PriceUnit;

  // --- 3 MODE BOOKING, berdasarkan price_unit ---
  const isHourly = unit === "hour"; // Workspace: rentang jam dalam 1 hari
  const isDaily = unit === "day"; // Vehicle & Equipment: rentang tanggal (pinjam-kembali)
  const isSessionBased = unit === "session"; // Service: 1 tanggal + 1 jam mulai, durasi tetap

  const maxQuantity = resource?.quantity || 1;
  const maxCapacity = resource?.capacity || null;

  const showQuantityInput = maxQuantity > 1;
  const showCapacityInfo =
    ["Workspace", "Vehicle"].includes(resource?.category) && Boolean(maxCapacity);

  // --- HITUNG DURASI ---
  let duration = 0;
  if (isSessionBased) {
    duration = startDate && startTime ? 1 : 0;
  } else if (isHourly) {
    if (startDate && startTime && endTime) {
      const diffInHours = Number(endTime) - Number(startTime);
      if (diffInHours > 0) duration = diffInHours;
    }
  } else if (isDaily) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
      );
      if (diffInDays >= 0) duration = diffInDays + 1;
    }
  }

  const effectiveDuration = duration > 0 ? duration : 1;
  const multiplierQuantity = showQuantityInput ? orderQuantity : 1;
  const grandTotal = basePrice * effectiveDuration * multiplierQuantity;

  // --- VALIDASI ---
  const isDateComplete = isSessionBased
    ? Boolean(startDate && startTime)
    : isHourly
    ? Boolean(startDate && startTime && endTime)
    : Boolean(startDate && endDate);

  const isQuantityValid =
    !showQuantityInput || (orderQuantity >= 1 && orderQuantity <= maxQuantity);

  const canReserve = isDateComplete && isQuantityValid;

  const unitLabel = isHourly ? "jam" : isDaily ? "hari" : "sesi";

  return {
    // state
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
    // derived
    basePrice,
    unit,
    unitLabel,
    isHourly,
    isDaily,
    isSessionBased,
    maxQuantity,
    maxCapacity,
    showQuantityInput,
    showCapacityInfo,
    duration,
    effectiveDuration,
    grandTotal,
    isDateComplete,
    isQuantityValid,
    canReserve,
  };
}