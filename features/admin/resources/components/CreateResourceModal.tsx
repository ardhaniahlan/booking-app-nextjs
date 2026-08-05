"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import resourceSchema, { ResourceFormInputs } from "../schema/resourceSchema";
import { useAuthStore } from "@/features/auth/store/authStore";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateResourceModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateResourceModalProps) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormInputs>({
    resolver: zodResolver(resourceSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ResourceFormInputs) => {
    try {
      if (!user) throw new Error("Anda harus login untuk membuat resource");

      const { error } = await supabase.from("resources").insert({
        name: data.name,
        category: data.category,
        capacity: data.capacity,
        is_active: true,
        created_by: user.id,
      });

      if (error) throw error;

      reset();
      onSuccess();
      onClose();

      toast.success("Resource berhasil dibuat");
    } catch (error: any) {
      console.error("Gagal menyimpan resource:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Resource</h2>
            <p className="text-sm text-slate-500">
              Add a new asset for booking.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Resource Name
            </label>
            <input
              type="text"
              placeholder="e.g. Apollo Boardroom"
              {...register("name")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select a category</option>
              <option value="Workspace">Workspace</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Equipment">Equipment</option>
              <option value="Service">Service</option>
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              {...register("capacity", { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#0b3c95] text-white font-medium rounded-lg hover:bg-blue-800 transition disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
