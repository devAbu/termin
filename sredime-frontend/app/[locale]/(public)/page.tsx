import { HomeContent } from "@/components/home/home-content";
import { getCities, getFeaturedSalons, searchSalons } from "@/lib/api/salons";

export default async function HomePage() {
  const [cities, featured, allSalons] = await Promise.all([
    getCities(),
    getFeaturedSalons({ city: "Sarajevo", limit: 4 }),
    searchSalons({}),
  ]);

  return <HomeContent cities={cities} featured={featured} allSalons={allSalons} />;
}
