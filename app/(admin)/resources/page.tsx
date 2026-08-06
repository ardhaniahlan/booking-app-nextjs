"use client";

import ResourceFormModal from "@/features/admin/resources/components/ResourceFormModal";
import { ResourceFormInputs } from "@/features/admin/resources/schema/resourceSchema";
import { Resource } from "@/features/admin/resources/types/resource.types";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { createBrowserClient } from "@supabase/ssr";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ResourcePage = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [resources, setResources] = useState<Resource[]>([]);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const totalAssets = resources.length;
  const activeAssets = resources.filter((res) => res.is_active).length;
  const offlineAssets = totalAssets - activeAssets;
  const utilizationPercentage =
    totalAssets === 0 ? 0 : Math.round((activeAssets / totalAssets) * 100);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = resources.filter(
    (res) => new Date(res.created_at) >= oneWeekAgo,
  ).length;

  const fetchResources = async () => {
    let query = supabase.from("resources").select(`
        id, name, description, category, capacity, price, price_unit, image_urls, is_active, created_by, created_at,
        profiles(full_name) 
      `);

    if (role === "vendor" && user) {
      query = query.eq("created_by", user.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Gagal menarik data:", error.message);
    } else if (data) {
      setResources(data as unknown as Resource[]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user, role]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setResources(
      resources.map((res) =>
        res.id === id ? { ...res, is_active: !currentStatus } : res,
      ),
    );

    const { error } = await supabase
      .from("resources")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Gagal update status:", error.message);
      fetchResources();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus resource "${name}"?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;

      fetchResources();
    } catch (error: any) {
      console.error("Gagal menghapus:", error.message);
      toast.error("Gagal menghapus data.");
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.name
      .toLowerCase()
      .includes(debouncedSearchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || res.category === filterCategory;

    let matchesStatus = true;
    if (filterStatus === "Active") matchesStatus = res.is_active === true;
    if (filterStatus === "Offline") matchesStatus = res.is_active === false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResources = filteredResources.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterCategory, filterStatus]);

  const openCreateModal = () => {
    setEditingResource(null);
    setModalMode("create");
  };

  // Buka modal buat edit
  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingResource(null);
  };

  // Handler CREATE
  const handleCreate = async (data: ResourceFormInputs) => {
    if (!user) {
      toast.error("Anda harus login untuk membuat resource");
      return;
    }

    const { error } = await supabase.from("resources").insert({
      name: data.name,
      description: data.description,
      category: data.category,
      capacity: data.capacity,
      quantity: data.quantity || 1,
      price: data.price,
      price_unit: data.price_unit,
      image_urls: data.image_urls || [],
      is_active: true,
      created_by: user.id,
    });

    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
      return; // penting: jangan lanjut close modal kalau gagal
    }

    toast.success("Resource berhasil dibuat");
    closeModal();
    fetchResources();
  };

  // Handler UPDATE
  const handleUpdate = async (data: ResourceFormInputs) => {
    if (!editingResource) return;

    const { error } = await supabase
      .from("resources")
      .update({
        name: data.name,
        description: data.description,
        category: data.category,
        capacity: data.capacity,
        quantity: data.quantity,
        price: data.price,
        price_unit: data.price_unit,
        image_urls: data.image_urls,
      })
      .eq("id", editingResource.id)
      .select();

    if (error) {
      toast.error("Gagal mengupdate: " + error.message);
      return;
    }

    toast.success("Resource berhasil diupdate");
    closeModal();
    fetchResources();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-800">
      <ResourceFormModal
        mode={modalMode ?? "create"}
        isOpen={modalMode !== null}
        onClose={closeModal}
        onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
        resource={editingResource}
      />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Resources
          </h1>
          <p className="text-slate-500">Manage and track booking assets</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Room">Room</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Equipment">Equipment</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-36 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Offline">Offline</option>
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#0b3c95] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Resource
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="w-72 flex flex-col gap-6 shrink-0">
          <div className="bg-[#eef4ff] p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
              Total Assets
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">
                {totalAssets}
              </span>
              <span className="text-sm font-medium text-blue-600">
                +{newThisWeek} this week
              </span>
            </div>
          </div>
          <div className="bg-[#242f3e] p-6 rounded-2xl text-white">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase">
              Utilization
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-600 border-t-amber-400 flex items-center justify-center">
                <span className="font-bold">{utilizationPercentage}%</span>
              </div>
              <div>
                <p className="font-bold text-lg">Active</p>
                <p className="text-sm text-slate-400">
                  {offlineAssets} offline
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Resource Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    Tidak ada data yang cocok dengan pencarian/filter Anda.
                  </td>
                </tr>
              ) : (
                paginatedResources.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                          📦
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{res.name}</p>
                          <p className="text-sm text-slate-500">
                            ID: {res.id.split("-")[0]}
                          </p>{" "}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md inline-block">
                        {res.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {res.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(res.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(res.id, res.is_active)}
                        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors mx-auto ${res.is_active ? "bg-[#0b3c95]" : "bg-slate-200"}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${res.is_active ? "translate-x-6" : "translate-x-0"}`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/resources/${res.id}`}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Manage Schedule & Details"
                        >
                          <CalendarDays className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Resource"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id, res.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredResources.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <span className="text-sm text-slate-500 font-medium">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredResources.length,
                )}{" "}
                of {filteredResources.length} entries
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
