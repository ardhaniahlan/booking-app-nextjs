"use client";

import { Search, Calendar, LayoutGrid, X } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const HeroSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); 
  
  const [isPending, startTransition] = useTransition();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All Categories");
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "All Categories");
    setStartDate(searchParams.get("start") || "");
    setEndDate(searchParams.get("end") || "");
  }, [searchParams]);

  const hasActiveFilters = searchParams.get("q") || searchParams.get("category") || searchParams.get("start");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (category && category !== "All Categories") params.set("category", category);
    
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
        return;
      }
      params.set("start", startDate);
      params.set("end", endDate);
    } else if (startDate || endDate) {
      alert("Mohon isi kedua tanggal (Mulai dan Selesai) untuk mencari ketersediaan.");
      return;
    }
    
    const isAlreadyOnExplore = pathname === "/explore";

    startTransition(() => {
      router.push(`/explore?${params.toString()}`, { 
        scroll: !isAlreadyOnExplore 
      });
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setCategory("All Categories");
    setStartDate("");
    setEndDate("");
    
    startTransition(() => {
      router.push("/explore", { scroll: false });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
      <div className="flex items-center gap-2 text-blue-700 font-semibold tracking-wider text-sm mb-6">
        <Search className="w-4 h-4" />
        <span>DISCOVER AVAILABILITY</span>
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-[1.1] mb-6">
        Temukan tempat <br className="hidden md:block" />
        atau barang yang dibutuhkan.
      </h1>
      
      <p className="text-slate-500 text-lg max-w-2xl mb-8">
        Telusuri koleksi barang kami yang terkurasi, tersedia secara instan untuk proyek, pertemuan, atau acara Anda berikutnya.
      </p>

      <div className="min-h-10 mb-4 flex items-center justify-center gap-3 w-full">
        {hasActiveFilters && (
           <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
             <span className="text-sm font-medium text-slate-600 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                Menampilkan hasil filter
             </span>
             <button 
               onClick={handleReset}
               type="button"
               disabled={isPending}
               className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full border border-red-200 transition flex items-center gap-1.5"
             >
               <X className="w-4 h-4" /> Reset Semua
             </button>
           </div>
        )}
      </div>

      <form 
        onSubmit={handleSearch}
        className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col lg:flex-row items-center gap-2 w-full max-w-5xl relative z-10"
      >
        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full lg:w-auto lg:border-r border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex flex-col text-left w-full">
            <span className="text-xs font-bold text-slate-900">What</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..." 
              className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
        </div>

        <div className="flex-[1.5] flex items-center gap-3 px-6 py-3 w-full lg:w-auto lg:border-r border-slate-200">
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-2 w-full">
            <div className="flex flex-col text-left w-full">
              <span className="text-xs font-bold text-slate-900">Start Date</span>
              <input 
                type="date" 
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-900 w-full cursor-pointer"
              />
            </div>
            <span className="text-slate-300">-</span>
            <div className="flex flex-col text-left w-full">
              <span className="text-xs font-bold text-slate-900">End Date</span>
              <input 
                type="date" 
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-900 w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full lg:w-auto">
          <LayoutGrid className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex flex-col text-left w-full">
            <span className="text-xs font-bold text-slate-900">Category</span>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-900 cursor-pointer appearance-none w-full"
            >
              <option value="All Categories">All Categories</option>
              <option value="Workspace">Workspace</option>
              <option value="Equipment">Equipment</option>
              <option value="Vehicle">Vehicle</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="bg-[#0b3c95] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-blue-800 transition-colors w-full lg:w-auto shadow-md shrink-0 disabled:opacity-70 disabled:cursor-wait"
        >
          {isPending ? "Mencari..." : "Search"}
        </button>
      </form>
    </div>
  );
}

export default HeroSearch;