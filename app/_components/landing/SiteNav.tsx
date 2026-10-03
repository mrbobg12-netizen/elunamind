import { getSettings } from "../../../lib/settings";
import { NavBar } from "./NavBar";

/** Server wrapper: reads the admin's branding, then renders the interactive bar. */
export async function SiteNav() {
  const { branding, flags } = await getSettings();
  return (
    <NavBar
      siteName={branding.siteName}
      logoUrl={branding.logoUrl}
      blogEnabled={flags.blogEnabled}
      notice={flags.maintenanceNote}
    />
  );
}
