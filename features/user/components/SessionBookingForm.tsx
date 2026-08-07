interface SessionBookingFormProps {
  startDate: string;
  setStartDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
}

export const SessionBookingForm = ({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
}: SessionBookingFormProps) => {
  return (
    <>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
          Pilih Tanggal
        </label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
          Pilih Jam Sesi
        </label>
        <select
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700"
        >
          <option value="" disabled>
            Pilih Jam
          </option>
          {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
            <option key={`session-${hour}`} value={hour}>
              {hour.toString().padStart(2, "0")}:00
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-400">
        Durasi sesi sudah ditentukan oleh penyedia layanan.
      </p>
    </>
  );
}