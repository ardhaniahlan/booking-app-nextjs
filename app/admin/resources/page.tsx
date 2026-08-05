"use client";

import { CreateResourceModal } from "@/features/admin/resources/components/CreateResourceModal";
import { Resource } from "@/features/admin/resources/types/resource.types";
import { createBrowserClient } from "@supabase/ssr";
import { Filter, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

const ResourcePage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select(
        `
        id, name, category, capacity, is_active, created_by, created_at,
        profiles(full_name) 
      `,
      )
      .order("created_at", { ascending: false });

    console.log("Supabase Data:", data);
    console.log("Supabase Error:", error);

    if (error) {
      console.error("Gagal menarik data:", error.message);
    } else if (data) {
      setResources(data as unknown as Resource[]);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

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

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-800">
      <CreateResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchResources}
      />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Resources
          </h1>
          <p className="text-slate-500">Manage and track booking assets</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
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
              <span className="text-5xl font-black text-slate-900">1,248</span>
              <span className="text-sm font-medium text-blue-600">
                +12 this week
              </span>
            </div>
          </div>

          <div className="bg-[#242f3e] p-6 rounded-2xl text-white">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase">
              Utilization
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-600 border-t-amber-400 flex items-center justify-center">
                <span className="font-bold">85%</span>
              </div>
              <div>
                <p className="font-bold text-lg">Active</p>
                <p className="text-sm text-slate-400">188 offline</p>
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
              {resources.map((res) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
