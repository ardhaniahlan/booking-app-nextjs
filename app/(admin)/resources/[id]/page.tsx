"use client";

import { AvailabilityRule } from "@/features/admin/resources/types/resource.types";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ImageIcon,
  Plus,
  Settings,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ResourceDetailPage = (props: {params: Promise<{ id: string}>}) => {
  const router = useRouter();
  const params = use(props.params);
  const resourceId = params.id;

  const [activeTab, setActiveTab] = useState("general");
  const [resourceName, setResourceName] = useState("Loading...");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);

  const MAX_IMAGES = 8;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const fetchResourceAndRules = useCallback(async () => {
    const { data: resData } = await supabase
      .from("resources")
      .select("name, image_urls") 
      .eq("id", resourceId)
      .single();
      
    if (resData) {
      setResourceName(resData.name);
      setImages(resData.image_urls || []); 
    }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (images.length + files.length > MAX_IMAGES) {
        alert(`Maksimal ${MAX_IMAGES} foto. Anda hanya bisa menambah ${MAX_IMAGES - images.length} foto lagi.`);
        return;
      }

      setIsUploading(true);
      const newUploadedUrls: string[] = [];

      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} terlalu besar! Maksimal 2MB.`);
          continue; 
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${resourceId}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resource_images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('resource_images')
          .getPublicUrl(fileName);

        newUploadedUrls.push(publicUrlData.publicUrl);
      }

      const updatedImages = [...images, ...newUploadedUrls];

      const { error: updateError } = await supabase
        .from('resources')
        .update({ image_urls: updatedImages })
        .eq('id', resourceId);

      if (updateError) throw updateError;

      setImages(updatedImages);
      
      e.target.value = '';

    } catch (error: any) {
      console.error("Gagal mengunggah gambar:", error.message);
      toast.error("Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (urlToRemove: string) => {
    if (!window.confirm("Hapus foto ini?")) return;

    try {
      const updatedImages = images.filter(url => url !== urlToRemove);
      
      const { error: updateError } = await supabase
        .from('resources')
        .update({ image_urls: updatedImages })
        .eq('id', resourceId);

      if (updateError) throw updateError;
      setImages(updatedImages);

      const urlParts = urlToRemove.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage.from('resource_images').remove([fileName]);

    } catch (error: any) {
      console.error("Gagal menghapus gambar:", error.message);
      toast.error("Gagal menghapus gambar.");
    }
  };

  const handleSaveSchedules = async () => {
    setIsSaving(true);
    try {
      await supabase.from("availability_rules").delete().eq("resource_id", resourceId);

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
        const { error } = await supabase.from("availability_rules").insert(dbRulesToInsert);
        if (error) throw error;
      }

      toast.success("Jadwal berhasil disimpan!");
      fetchResourceAndRules();
    } catch (error: any) {
      console.error("Gagal menyimpan jadwal:", error.message);
      toast.error("Gagal menyimpan jadwal.");
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

      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Photo Gallery</h2>
                <p className="text-sm text-slate-500">
                  Upload up to {MAX_IMAGES} high-quality images. ({images.length}/{MAX_IMAGES})
                </p>
              </div>
              
              {images.length < MAX_IMAGES && (
                <label className="cursor-pointer group">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-[#0b3c95] text-white hover:bg-blue-800'}`}>
                    {isUploading ? "Uploading..." : <><UploadCloud className="w-4 h-4" /> Add Photos</>}
                  </div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    multiple
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.length === 0 ? (
                <div className="col-span-full py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                  <span className="text-sm font-semibold text-slate-500">No photos uploaded yet</span>
                  <span className="text-xs mt-1">Supported formats: JPG, PNG. Max 2MB per file.</span>
                </div>
              ) : (
                images.map((url, index) => (
                  <div key={url} className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-800 shadow-sm">
                        Cover
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ResourceDetailPage;
