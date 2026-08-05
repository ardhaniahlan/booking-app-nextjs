import { createBrowserClient } from "@supabase/ssr";
import { Resource } from "../types/resource.types";
import resourceSchema, { ResourceFormInputs } from "../schema/resourceSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { X } from "lucide-react";

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource: Resource | null;
}

export function EditResourceModal({ isOpen, onClose, onSuccess, resource }: EditResourceModalProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormInputs>({
    resolver: zodResolver(resourceSchema),
  });

  useEffect(() => {
    if (resource) {
      reset({
        name: resource.name,
        category: resource.category,
        capacity: resource.capacity,
      });
    }
  }, [resource, reset]);

  if (!isOpen || !resource) return null;

  const onSubmit = async (data: ResourceFormInputs) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update({
          name: data.name,
          category: data.category,
          capacity: data.capacity,
        })
        .eq("id", resource.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Gagal mengupdate resource:", error.message);
      alert("Gagal mengupdate: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Resource</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resource Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                {...register("category")}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="Room">Room</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Equipment">Equipment</option>
                <option value="Service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                {...register("capacity", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0b3c95] hover:bg-blue-800 rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}