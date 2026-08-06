import { createServerClient } from "@supabase/ssr";
import HeroSearch from "@/features/user/components/HeroSearch";
import ResourceCard from "@/features/user/components/ResourceCard";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const ExplorePage = async () => {
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
    },
  );

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resources:", JSON.stringify(error, null, 2));
  }

  return (
    <main className="min-h-screen bg-[#f8fafe]">
      <HeroSearch />

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Available Resources
            </h2>
            <span className="text-slate-500 text-sm mt-1">
              [ {resources?.length || 0} results ]
            </span>
          </div>

          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              ></path>
            </svg>
            Sort: Recommended
          </button>
        </div>

        {resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((item) => {
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
                  imageUrl={coverPhoto}
                  isActive={item.is_active}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">
              Belum ada resource yang tersedia saat ini.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default ExplorePage;
