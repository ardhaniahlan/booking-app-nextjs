import { createBrowserClient } from "@supabase/ssr";
import HeroSearch from "@/features/user/components/HeroSearch";
import ResourceCard from "@/features/user/components/ResourceCard";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const ExplorePage = async ({ searchParams }: ExplorePageProps) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const categoryFilter = resolvedParams.category || "";

  const startDate = resolvedParams.start || "";
  const endDate = resolvedParams.end || "";

  let bookedResourceIds: string[] = [];

  if (startDate && endDate) {
    const startTimestamp = new Date(`${startDate}T00:00:00`).toISOString();
    const endTimestamp = new Date(`${endDate}T23:59:59`).toISOString();

    const { data: overlappingBookings, error: checkError } = await supabase
      .from("bookings")
      .select("resource_id")
      .in("status", ["pending", "paid", "confirmed"])
      .lte("start_date", endTimestamp) 
      .gte("end_date", startTimestamp);

    if (checkError) {
      console.error("Gagal mengecek jadwal bentrok:", checkError);
    } else if (overlappingBookings) {
      bookedResourceIds = overlappingBookings.map((b) => b.resource_id);
    }
  }

  let query = supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  if (bookedResourceIds.length > 0) {
    query = query.not("id", "in", `(${bookedResourceIds.join(",")})`);
  }

  const { data: resources, error } = await query;

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
              {searchQuery || categoryFilter ? "Search Results" : "Available Resources"}
            </h2>
            <span className="text-slate-500 text-sm mt-1">
              [ {resources?.length || 0} results ]
            </span>
          </div>
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
                  rating={5}
                  capacity={item.capacity || 1}
                  quantity={item.quantity || 1}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 mb-2">
              Tidak ada hasil untuk pencarian ini.
            </p>
            {/* Tombol untuk mereset pencarian */}
            {(searchQuery || categoryFilter) && (
               <a href="/explore" className="text-blue-600 font-bold hover:underline">
                 Lihat semua resources
               </a>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default ExplorePage;