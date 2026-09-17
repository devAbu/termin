import { SearchContent } from "@/components/discovery/search-content";
import { searchSalons } from "@/lib/api/salons";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ grad?: string; q?: string; kategorija?: string }>;
}) {
  const { grad, q, kategorija } = await searchParams;
  const salons = await searchSalons({});

  return (
    <SearchContent
      salons={salons}
      initialCity={grad ?? ""}
      initialQuery={q ?? ""}
      initialCategory={kategorija ?? ""}
    />
  );
}
