import Link from "next/link";

const publicRoutes = [
  { path: "/", label: "Home" },
  { path: "/posts", label: "Posts listing" },
  { path: "/posts/[slug]", label: "Post detail" },
  { path: "/[slug]", label: "Dynamic page" },
  { path: "/collections", label: "Collections listing" },
  { path: "/collections/[id]", label: "Collection detail" },
  { path: "/collections/[id]/volumes/[volumeId]", label: "Volume detail" },
  { path: "/archive", label: "Archive listing" },
  { path: "/archive/[collection]", label: "Archive collection" },
  { path: "/archive/[collection]/[series]", label: "Archive series" },
  { path: "/archive/[collection]/[series]/[volume]", label: "Archive volume" },
  { path: "/data", label: "Datasets listing" },
  { path: "/data/[slug]", label: "Dataset detail" },
  { path: "/documents", label: "Documents listing" },
  { path: "/documents/[slug]", label: "Document detail" },
  { path: "/maps", label: "Maps listing" },
  { path: "/maps/[slug]", label: "Map detail" },
  { path: "/layers", label: "Layers listing" },
  { path: "/layers/[slug]", label: "Layer detail" },
  { path: "/categories/[slug]", label: "Category page" },
  { path: "/search", label: "Search" },
  { path: "/viewer/[collectionId]/[volumeId]", label: "Document viewer" },
  { path: "/login", label: "Login" },
];

const adminRoutes = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/posts", label: "Posts list" },
  { path: "/admin/posts/[id]", label: "Post editor" },
  { path: "/admin/pages", label: "Pages list" },
  { path: "/admin/pages/[id]", label: "Page editor" },
  { path: "/admin/taxonomy", label: "Taxonomy manager" },
  { path: "/admin/categories", label: "Categories list" },
  { path: "/admin/categories/[id]", label: "Category editor" },
  { path: "/admin/tags", label: "Tags list" },
  { path: "/admin/tags/[id]", label: "Tag editor" },
  { path: "/admin/collections", label: "Collections list" },
  { path: "/admin/collections/[id]", label: "Collection editor" },
  { path: "/admin/collections/[id]/series", label: "Series list" },
  { path: "/admin/collections/[id]/series/[seriesId]", label: "Series editor" },
  { path: "/admin/collections/volume/[id]", label: "Volume editor" },
  { path: "/admin/documents", label: "Documents list" },
  { path: "/admin/documents/new", label: "New document" },
  { path: "/admin/documents/[id]", label: "Document editor" },
  { path: "/admin/artifacts", label: "Artifacts list" },
  { path: "/admin/artifacts/[id]", label: "Artifact editor" },
  { path: "/admin/artifact-categories", label: "Artifact categories" },
  { path: "/admin/datasets", label: "Datasets list" },
  { path: "/admin/datasets/[id]", label: "Dataset editor" },
  { path: "/admin/layers", label: "Layers list" },
  { path: "/admin/layers/new", label: "New layer" },
  { path: "/admin/layers/[id]", label: "Layer editor" },
  { path: "/admin/maps", label: "Maps list" },
  { path: "/admin/maps/[id]", label: "Map editor" },
  { path: "/admin/maps2", label: "Data Studio list" },
  { path: "/admin/maps2/[id]", label: "Data Studio editor" },
  { path: "/admin/media", label: "Media library" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/periods", label: "Periods list" },
  { path: "/admin/periods/[id]", label: "Period editor" },
  { path: "/admin/places", label: "Places list" },
  { path: "/admin/regions", label: "Regions list" },
  { path: "/admin/settings", label: "Settings" },
  { path: "/admin/settings/menus", label: "Menu editor" },
  { path: "/admin/routes", label: "Routes (this page)" },
];

const apiRoutes = [
  { path: "/api/cms", label: "CMS unified endpoint" },
  { path: "/api/cms/schema", label: "CMS schema" },
  { path: "/api/posts", label: "Posts API" },
  { path: "/api/pages", label: "Pages API" },
  { path: "/api/documents", label: "Documents API" },
  { path: "/api/categories", label: "Categories API" },
  { path: "/api/tags", label: "Tags API" },
  { path: "/api/collections", label: "Collections API" },
  { path: "/api/series", label: "Series API" },
  { path: "/api/datasets", label: "Datasets API" },
  { path: "/api/maps", label: "Maps API" },
  { path: "/api/layers", label: "Layers API" },
  { path: "/api/geo/maps", label: "Geo Maps API" },
  { path: "/api/geo/layers", label: "Geo Layers API" },
  { path: "/api/geo/geojson", label: "GeoJSON API" },
  { path: "/api/geo/spatial/nearby", label: "Spatial nearby" },
  { path: "/api/geo/spatial/within", label: "Spatial within" },
  { path: "/api/places", label: "Places API" },
  { path: "/api/places/search", label: "Places search" },
  { path: "/api/translations", label: "Translations" },
  { path: "/api/translate", label: "Translate" },
  { path: "/api/menus", label: "Menus API" },
];

function isDynamic(path: string) {
  return path.includes("[");
}

function RouteTable({ title, routes }: { title: string; routes: { path: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2 font-medium">Path</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.path} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-xs">
                  {isDynamic(route.path) ? (
                    <span className="text-muted-foreground">{route.path}</span>
                  ) : (
                    <Link href={route.path} className="text-blue-500 hover:underline">
                      {route.path}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{route.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Site Routes</h1>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{publicRoutes.length} public</span>
        <span>{adminRoutes.length} admin</span>
        <span>{apiRoutes.length} API</span>
        <span className="font-medium text-foreground">
          {publicRoutes.length + adminRoutes.length + apiRoutes.length} total
        </span>
      </div>
      <RouteTable title="Public Routes" routes={publicRoutes} />
      <RouteTable title="Admin Routes" routes={adminRoutes} />
      <RouteTable title="API Routes" routes={apiRoutes} />
    </div>
  );
}
