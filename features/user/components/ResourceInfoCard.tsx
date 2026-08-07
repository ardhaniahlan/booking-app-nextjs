import { CheckCircle, Package, Users } from "lucide-react";

interface ResourceInfoCardProps {
  category: string;
  description?: string;
  isActive: boolean;
  showCapacityInfo: boolean;
  maxCapacity: number | null;
  showQuantityInput: boolean;
  maxQuantity: number;
}

export const ResourceInfoCard = ({
  category,
  description,
  isActive,
  showCapacityInfo,
  maxCapacity,
  showQuantityInput,
  maxQuantity,
}: ResourceInfoCardProps) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        About this {category || "space"}
      </h2>
      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
        {description || "Tidak ada deskripsi spesifik untuk layanan ini."}
      </p>

      <div className="grid grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-6">
        {showCapacityInfo && (
          <div className="flex items-center gap-3 text-slate-700 font-medium">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            Kapasitas: {maxCapacity} Orang
          </div>
        )}

        {showQuantityInput && (
          <div className="flex items-center gap-3 text-slate-700 font-medium">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            Unit Tersedia: {maxQuantity}
          </div>
        )}

        <div className="flex items-center gap-3 text-slate-700 font-medium">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          Status: {isActive ? "Tersedia untuk disewa" : "Sedang tidak tersedia"}
        </div>
      </div>
    </div>
  );
}