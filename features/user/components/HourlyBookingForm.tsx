interface HourlyBookingFormProps {
  startDate: string;
  setStartDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
}

export const HourlyBookingForm = ({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: HourlyBookingFormProps) => {
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
            Mulai
          </label>
          <select
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              if (endTime && Number(e.target.value) >= Number(endTime)) {
                setEndTime("");
              }
            }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700"
          >
            <option value="" disabled>
              Pilih Jam
            </option>
            {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
              <option key={`start-${hour}`} value={hour}>
                {hour.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
            Selesai
          </label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={!startTime}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-700 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              Pilih Jam
            </option>
            {Array.from({ length: 19 }, (_, i) => i + 6)
              .filter((hour) => (startTime ? hour > Number(startTime) : true))
              .map((hour) => (
                <option key={`end-${hour}`} value={hour}>
                  {hour === 24 ? "24:00" : `${hour.toString().padStart(2, "0")}:00`}
                </option>
              ))}
          </select>
        </div>
      </div>
    </>
  );
}