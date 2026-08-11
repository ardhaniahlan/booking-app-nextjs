import ResourceCard from "@/features/user/components/ResourceCard";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { HeartCrack } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const FavoritePage = async () => {

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: favoritesData, error } = await supabase
    .from("favorites")
    .select(`
      created_at,
      resources (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal menarik data favorit:", error);
  }

  const favoriteResources = favoritesData
    ?.map((fav: any) => fav.resources)
    .filter((resource) => resource !== null) || []; 
  return (
    <main className="min-h-screen bg-[#f8fafe] py-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            My Favorites
          </h1>
          <p className="text-slate-500">
            Koleksi barang dan ruangan yang Anda simpan untuk nanti.
          </p>
        </div>

        {favoriteResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteResources.map((item: any) => {
              const coverPhoto =
                item.image_urls && item.image_urls.length > 0
                  ? item.image_urls[0]
                  : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";

              return (
                <ResourceCard
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  category={item.category || "General"}
                  description={item.description}
                  price={item.price || 0}
                  priceUnit={`/${item.price_unit || "day"}`}
                  quantity={item.quantity}
                  capacity={item.capacity}
                  imageUrl={coverPhoto}
                  isActive={item.is_active}
                />
              );
            })}
          </div>
        ) : (
          
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <HeartCrack className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Belum ada favorit
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Anda belum menyimpan barang atau ruangan apa pun. Jelajahi koleksi kami dan klik ikon hati untuk menyimpannya di sini.
            </p>
            <a
              href="/explore"
              className="px-6 py-3 bg-[#1a4b9c] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm inline-block"
            >
              Mulai Eksplorasi
            </a>
          </div>

        )}
      </section>
    </main>
  );
}

export default FavoritePage