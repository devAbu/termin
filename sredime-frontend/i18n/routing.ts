import { defineRouting } from "next-intl/routing";

// V1 ships Bosnian only, but routing is locale-prefixed (/bs/...) from day one
// so HR/SR/EN can be added later without a routing redesign — docs/frontend.md.
export const routing = defineRouting({
  locales: ["bs"],
  defaultLocale: "bs",
});
