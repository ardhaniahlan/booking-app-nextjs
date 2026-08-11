"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuthStore } from "@/features/auth/store/authStore";
import { toast } from "sonner";

interface ToggleFavoriteProps {
  resourceId: string;
  className?: string;
}

const ToggleFavorite = ({ resourceId, className = "" }: ToggleFavoriteProps) => {
  const { user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("resource_id", resourceId)
          .eq("user_id", user.id)
          .single();

        if (data) setIsFavorited(true);
      } catch (error) {
      }
    };

    checkFavoriteStatus();
  }, [resourceId, user, supabase]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan ke Favorit.");
      return;
    }

    const previousState = isFavorited;
    setIsFavorited(!isFavorited); 

    try {
      if (previousState) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("resource_id", resourceId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ resource_id: resourceId, user_id: user.id });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Gagal update favorit:", error);
      setIsFavorited(previousState); 
      alert("Gagal menyimpan ke favorit. Silakan coba lagi.");
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`transition-all duration-200 ${className}`}
    >
      <Heart
        className={`w-full h-full transition-colors duration-300 ${
          isFavorited 
            ? "fill-red-500 text-red-500" 
            : "text-slate-400 hover:text-red-500"
        }`}
      />
    </button>
  );
}

export default ToggleFavorite;