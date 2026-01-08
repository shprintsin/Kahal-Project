import { 
    getContentType, 
    getActionsForContentType, 
    ContentTypeDefinition 
} from "@/app/admin/system";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

// Define the taxonomies we want to show
const TAXONOMY_KEYS = ["tags", "categories", "periods", "places", "artifact-categories"];

export default async function TaxonomyPage() {
  const taxonomies = [];

  for (const key of TAXONOMY_KEYS) {
    const def = getContentType(key);
    if (!def) continue;

    const actions = getActionsForContentType(def);
    const data = await actions.list({ limit: 100 }); // Reasonable limit for now

    // Sanitize definition for client
    const sanitizedDef = {
        name: def.name,
        plural: def.plural,
        slug: def.slug,
        icon: typeof def.icon === 'string' ? def.icon : 'Circle', // Fallback if component
        fields: def.fields.map(f => ({
            key: f.key,
            label: f.label,
            type: f.type,
            width: f.width,
            placeholder: f.placeholder,
            showInList: f.showInList,
            order: f.order,
            // Skip validation, relation config that might be complex, etc if not needed
        }))
    };

    taxonomies.push({
      key,
      def: sanitizedDef as any, // Cast to any or partial type to satisfy TS if needed, or update prop type
      initialData: data.items,
      actions: {
          create: actions.create,
          update: actions.update,
          delete: actions.delete
      }
    });
  }

  return <TaxonomyManager taxonomies={taxonomies} />;
}
