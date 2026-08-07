interface DailyBookingFormProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export const DailyBookingForm = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: DailyBookingFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
          Tgl Ambil
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
          Tgl Kembali
        </label>
        <input
          type="date"
          min={startDate || new Date().toISOString().split("T")[0]}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700"
        />
      </div>
    </div>
  );
}