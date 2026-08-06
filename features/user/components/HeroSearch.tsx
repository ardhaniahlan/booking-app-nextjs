"use client";

import { Search, Calendar, LayoutGrid } from "lucide-react";

const HeroSearch = () => {
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
      
      <p className="text-slate-500 text-lg max-w-2xl mb-12">
        Telusuri koleksi barang kami yang terkurasi, tersedia secara instan untuk proyek, pertemuan, atau acara Anda berikutnya.
      </p>

      <div className="bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col md:flex-row items-center gap-2 w-full max-w-4xl">
        
        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full md:w-auto md:border-r border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <div className="flex flex-col text-left w-full">
            <span className="text-xs font-bold text-slate-900">What</span>
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder:text-slate-400 w-full"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full md:w-auto md:border-r border-slate-200 cursor-pointer hover:bg-slate-50 rounded-full transition-colors">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900">When</span>
            <span className="text-sm text-slate-500">Any dates</span>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full md:w-auto cursor-pointer hover:bg-slate-50 rounded-full transition-colors">
          <LayoutGrid className="w-5 h-5 text-slate-400" />
          <div className="flex flex-col text-left w-full">
            <span className="text-xs font-bold text-slate-900">Category</span>
            <select className="bg-transparent border-none outline-none text-sm text-slate-600 cursor-pointer appearance-none w-full">
              <option>All Categories</option>
              <option>Workspace</option>
              <option>Equipment</option>
              <option>Vehicle</option>
            </select>
          </div>
        </div>

        <button className="bg-[#0b3c95] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-blue-800 transition-colors w-full md:w-auto shadow-md">
          Search
        </button>
      </div>

    </div>
  );
}

export default HeroSearch;