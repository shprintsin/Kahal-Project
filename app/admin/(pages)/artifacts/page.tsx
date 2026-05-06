import { getArtifacts } from "@/app/admin/actions/artifacts";
import { pickI18n } from "@/lib/i18n/fallback";
import { ArtifactsClientPage } from "./artifacts-client-page";

export default async function ArtifactsPage() {
  const artifacts = await getArtifacts();
  const normalized = artifacts.map((a: any) => ({
    ...a,
    title: pickI18n(a.title, 'en'),
    excerpt: typeof a.excerpt === 'string' ? a.excerpt : pickI18n(a.excerpt, 'en', '') || null,
    artifactCategory: a.artifactCategory ? { ...a.artifactCategory, title: pickI18n(a.artifactCategory.title, 'en') } : null,
    periods: (a.periods || []).map((p: any) => ({ ...p, name: pickI18n(p.name, 'en') })),
    regions: (a.regions || []).map((r: any) => ({ ...r, name: pickI18n(r.name, 'en') })),
  }));

  return <ArtifactsClientPage initialArtifacts={normalized} />;
}
