"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  X,
  Building2,
  Car,
  Wrench,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import resourceSchema, { ResourceFormInputs } from "../schema/resourceSchema";
import { Resource } from "../types/resource.types";

type Category = "Workspace" | "Vehicle" | "Equipment" | "Service";

const CATEGORIES: {
  value: Category;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    value: "Workspace",
    label: "Workspace",
    hint: "Ruang & meeting",
    icon: Building2,
  },
  { value: "Vehicle", label: "Vehicle", hint: "Kendaraan", icon: Car },
  { value: "Equipment", label: "Equipment", hint: "Peralatan", icon: Wrench },
  {
    value: "Service",
    label: "Service",
    hint: "Layanan khusus",
    icon: Sparkles,
  },
];

interface ResourceFormModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormInputs) => Promise<void>;
  resource?: Resource | null;
}

const ResourceFormModal = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
  resource,
}: ResourceFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormInputs>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      category: "",
      name: "",
      description: "",
      capacity: undefined,
      quantity: 1,
      price: undefined,
      price_unit: "hour",
      image_urls: [],
      city: "",
      address: "",
      is_active: true,
    },
  });

  const selectedCategory = watch("category") as Category | "";
  const needsCapacity =
    selectedCategory === "Workspace" || selectedCategory === "Vehicle";

  useEffect(() => {
    if (mode === "edit" && resource) {
      reset({
        category: resource.category,
        name: resource.name,
        description: resource.description ?? "",
        capacity: resource.capacity ?? undefined,
        quantity: resource.quantity ?? 1,
        price: resource.price,
        price_unit: resource.price_unit,
        image_urls: resource.image_urls ?? [],
        city: resource.city ?? "",
        address: resource.address ?? "",
        is_active: resource.is_active ?? true,
      });
    }
    if (mode === "create" && isOpen) {
      reset({
        category: "",
        name: "",
        description: "",
        capacity: undefined,
        quantity: 1,
        price: undefined,
        price_unit: "hour",
        image_urls: [],
        city: "",
        address: "",
      });
    }
  }, [mode, resource, isOpen, reset]);

  if (!isOpen) return null;
  if (mode === "edit" && !resource) return null;

  const submitHandler = async (data: ResourceFormInputs) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === "create" ? "Resource baru" : "Edit resource"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === "create"
                ? "Tambahkan aset yang bisa dibooking."
                : `Mengubah "${resource?.name}".`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitHandler)}
          className="flex flex-col overflow-hidden"
        >
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ value, label, hint, icon: Icon }) => {
                  const isSelected = selectedCategory === value;
                  return (
                    <label
                      key={value}
                      className={`relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "border-[#0b3c95] bg-blue-50/60 ring-1 ring-[#0b3c95]"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register("category")}
                        className="sr-only"
                      />
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-[#0b3c95] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${
                            isSelected ? "text-[#0b3c95]" : "text-slate-700"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="block text-xs text-slate-500 truncate">
                          {hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.category.message}
                </p>
              )}
            </div>

            {selectedCategory && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="h-px bg-slate-100" />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama resource
                  </label>
                  <input
                    type="text"
                    placeholder="cth. Apollo Boardroom"
                    {...register("name")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register("is_active")}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="is_active"
                      className="font-bold text-slate-800 cursor-pointer"
                    >
                      Resource Aktif
                    </label>
                    <p className="text-xs text-slate-500">
                      Matikan jika aset sedang rusak, direnovasi, atau tidak
                      ingin disewakan sementara waktu.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Fasilitas, aturan pakai, atau detail lain..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                  />
                </div>

                <div className={needsCapacity ? "grid grid-cols-2 gap-3" : ""}>
                  {needsCapacity && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Kapasitas (orang/penumpang)
                      </label>
                      <input
                        type="number"
                        min={1}
                        placeholder="cth. 10"
                        {...register("capacity", { valueAsNumber: true })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                      />
                      {errors.capacity && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.capacity.message}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Jumlah unit tersedia
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="cth. 1"
                      {...register("quantity", { valueAsNumber: true })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                    />
                    {errors.quantity && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Harga
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                        Rp
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...register("price", { valueAsNumber: true })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Satuan
                    </label>
                    <select
                      {...register("price_unit")}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3c95]/40 focus:border-[#0b3c95] transition"
                    >
                      <option value="hour">Per jam</option>
                      <option value="day">Per hari</option>
                      <option value="session">Per sesi</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">
                    Lokasi / Titik Pengambilan
                  </h4>
                  <div className="grid grid-rows-1 md:grid-cols-2 gap-4">
                    <div className="flex-1 flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Kota
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jakarta Selatan, Bandung, dll"
                        {...register("city")}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Alamat Lengkap
                      </label>
                      <textarea
                        {...register("address")}
                        rows={2}
                        placeholder="Nama Gedung, Nama Jalan, Patokan..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-6 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0b3c95] hover:bg-blue-800 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Menyimpan..."
                : mode === "create"
                  ? "Simpan resource"
                  : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;
