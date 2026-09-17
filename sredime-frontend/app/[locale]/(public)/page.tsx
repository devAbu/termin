import { HomeContent } from "@/components/home/home-content";
import { getCities, getFeaturedSalons } from "@/lib/api/salons";

export default async function HomePage() {
  const [cities, featured] = await Promise.all([
    getCities(),
    getFeaturedSalons({ city: "Sarajevo", limit: 4 }),
  ]);

  return <HomeContent cities={cities} featured={featured} />;
}
