import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

// Ganti `any` dengan tipe Resource asli kamu dari resource.types.ts
// begitu kolom city/address sudah ditambahkan di sana.
export function useResourceDetail(resourceId: string) {
  const [resource, setResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select(`*, profiles(full_name)`)
          .eq("id", resourceId)
          .single();

        if (error) throw error;
        if (isMounted) setResource(data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [resourceId]);

  return { resource, isLoading };
}