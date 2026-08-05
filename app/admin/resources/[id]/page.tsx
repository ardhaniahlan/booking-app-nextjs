"use client";

import { AvailabilityRule } from "@/features/admin/resources/types/resource.types";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ResourceDetailPage = (props: {params: Promise<{ id: string}>}) => {
  const router = useRouter();
  
  const params = use(props.params);
  const resourceId = params.id;

  const [activeTab, setActiveTab] = useState("availability");
  const [resourceName, setResourceName] = useState("Loading...");
  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const fetchResourceAndRules = useCallback(async () => {
    const { data: resData } = await supabase
      .from("resources")
      .select("name")
      .eq("id", resourceId)
      .single();
    if (resData) setResourceName(resData.name);

    const { data: rulesData } = await supabase
      .from("availability_rules")
      .select("*")
      .eq("resource_id", resourceId)
      .order("day_of_week", { ascending: true });

    if (rulesData && rulesData.length > 0) {
      const loadedRules = rulesData.map((r: any) => ({
        id: r.id,
        day_of_week: r.day_of_week.toString(),
        start_time: r.start_time.substring(0, 5),
        end_time: r.end_time.substring(0, 5),
      }));
      setRules(loadedRules);
    } else {
      setRules([]);
    }
  }, [resourceId, supabase]);

  useEffect(() => {
    fetchResourceAndRules();
  }, [fetchResourceAndRules]);

  const handleSaveSchedules = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("availability_rules")
        .delete()
        .eq("resource_id", resourceId);

      const dbRulesToInsert: any[] = [];

      rules.forEach((rule) => {
        let days: number[] = [];
        
        if (rule.day_of_week === "Mon-Fri") days = [1, 2, 3, 4, 5];
        else if (rule.day_of_week === "Sat-Sun") days = [6, 0];
        else if (rule.day_of_week === "Everyday") days = [0, 1, 2, 3, 4, 5, 6];
        else days = [parseInt(rule.day_of_week)];

        days.forEach((day) => {
          dbRulesToInsert.push({
            resource_id: resourceId,
            day_of_week: day,
            start_time: rule.start_time,
            end_time: rule.end_time,
          });
        });
      });

      if (dbRulesToInsert.length > 0) {
        const { error } = await supabase
          .from("availability_rules")
          .insert(dbRulesToInsert);

        if (error) throw error;
      }

      alert("Jadwal berhasil disimpan!");
      fetchResourceAndRules();

    } catch (error: any) {
      console.error("Gagal menyimpan jadwal:", error.message);
      alert("Gagal menyimpan jadwal. Cek console log.");
    } finally {
      setIsSaving(false);
    }
  };

  const addRule = () => {
    setRules([...rules, {
      id: Math.random().toString(),
      day_of_week: "Mon-Fri",
      start_time: "09:00",
      end_time: "17:00",
    }]);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  return (
    <div className="p-8 w-full text-slate-800">
      <button 
        onClick={() => router.push("/admin/resources")}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">{resourceName}</h1>
        <p className="text-slate-500">Manage settings, schedules, and details for this asset.</p>
      </div>

      <div className="flex gap-8 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "general" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings className="w-4 h-4" /> General Info
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "availability" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Availability
        </button>
      </div>

      {activeTab === "availability" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Clock className="w-6 h-6 text-[#0b3c95]" />
                <h2 className="text-xl font-bold text-slate-800">Availability Rules</h2>
              </div>
              <p className="text-sm text-slate-500 ml-9">Define when this resource can be booked.</p>
            </div>
            <button 
              onClick={addRule}
              className="flex items-center gap-2 text-sm font-bold text-[#0b3c95] hover:bg-blue-50 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          <div className="p-6 space-y-4">
            {rules.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No availability rules defined yet. Click "Add Rule" to start.
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="flex items-end gap-4 p-4 bg-[#f8fafc] border border-slate-100 rounded-xl relative group transition hover:border-blue-100 hover:bg-blue-50/30">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Days</label>
                    <select 
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                      value={rule.day_of_week}
                      onChange={(e) => {
                        const newRules = rules.map(r => r.id === rule.id ? { ...r, day_of_week: e.target.value } : r);
                        setRules(newRules);
                      }}
                    >
                      <option value="Mon-Fri">Mon - Fri (Weekdays)</option>
                      <option value="Sat-Sun">Sat - Sun (Weekends)</option>
                      <option value="Everyday">Everyday</option>
                      <option disabled>──────────</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>

                  <div className="w-40">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Start Time</label>
                    <input 
                      type="time" 
                      value={rule.start_time}
                      onChange={(e) => {
                        const newRules = rules.map(r => r.id === rule.id ? { ...r, start_time: e.target.value } : r);
                        setRules(newRules);
                      }}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <span className="mb-3 text-slate-400 font-bold">-</span>

                  <div className="w-40">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">End Time</label>
                    <input 
                      type="time" 
                      value={rule.end_time}
                      onChange={(e) => {
                        const newRules = rules.map(r => r.id === rule.id ? { ...r, end_time: e.target.value } : r);
                        setRules(newRules);
                      }}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="mb-1 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove rule"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSaveSchedules}
              disabled={isSaving}
              className="bg-[#0b3c95] text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Schedules"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "general" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
          This tab can be used later to edit Name, Category, or Capacity without using the Pop-up Modal.
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;
