import Link from "next/link";
import { ArrowRight, Star, Users, Package } from "lucide-react";

interface ResourceCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUnit: string;
  quantity: string;
  capacity: string;
  imageUrl: string;
  rating?: number;
  isActive: boolean;
}

const ResourceCard = ({
  id,
  title,
  category,
  description,
  price,
  priceUnit,
  quantity,
  capacity,
  imageUrl,
  rating = 5.0,
  isActive,
}: ResourceCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-600 animate-pulse" : "bg-slate-400"}`}
          ></div>
          <span className="text-xs font-bold text-slate-700">
            {isActive ? "Available Now" : "Currently Offline"}
          </span>
        </div>

        <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            {category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-sm font-bold text-slate-700">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        <div className="mb-4 text-xs font-semibold text-slate-500">
          {category === "Equipment" || category === "Service" ? (
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Sisa {quantity || 1} Unit
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Maks. {capacity || 1} Orang
            </span>
          )}
        </div>

        <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-auto">
          <div>
            <span className="text-xs font-medium text-slate-400">
              Starting at
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                ${price}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {priceUnit}
              </span>
            </div>
          </div>

          <Link
            href={`/explore/${id}`}
            className="px-5 py-2.5 bg-[#f0f4ff] text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
          >
            Book <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
