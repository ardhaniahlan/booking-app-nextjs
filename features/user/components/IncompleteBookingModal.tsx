interface IncompleteProfileModalProps {
  isOpen: boolean;
  category: string;
  onClose: () => void;
  onComplete: () => void;
}

export const IncompleteProfileModal = ({
  isOpen,
  category,
  onClose,
  onComplete,
}: IncompleteProfileModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Lengkapi Profil Anda</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Untuk menyewa <span className="font-semibold">{category}</span>, kami mewajibkan
          penyewa untuk melengkapi Alamat dan Nomor Telepon demi keamanan bersama.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          >
            Lengkapi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}