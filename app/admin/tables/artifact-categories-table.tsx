"use client";

import { InlineEditableTable, ColumnConfig } from "../../../components/admin/inline-editable-table";
import { createArtifactCategory, updateArtifactCategory, deleteArtifactCategory } from "../actions/artifact-categories";
import { DEFAULT_LANGUAGES, buildI18nColumns, flattenI18n, unflattenI18n } from "../components/tables/table-utils";

interface ArtifactCategory {
    id: string;
    slug: string;
    title: string;
    titleI18n: any;
    createdAt?: Date | string | null;
}

interface ArtifactCategoriesTableProps {
  categories: ArtifactCategory[];
}

export function ArtifactCategoriesTable({ categories }: ArtifactCategoriesTableProps) {
    const columns: ColumnConfig[] = [
        { key: "slug", label: "Slug", width: "w-[15%]", placeholder: "slug" },
        { key: "title", label: "Title", width: "w-[20%]", placeholder: "Title" },
        ...buildI18nColumns(DEFAULT_LANGUAGES, "Title", "w-[20%]") as ColumnConfig[],
    ];

    const handleSave = async (id: string, data: Record<string, any>) => {
        const payload = {
            slug: data.slug,
            title: data.title,
            ...unflattenI18n(data, "titleI18n", DEFAULT_LANGUAGES),
        };
        
        const updated = await updateArtifactCategory(id, payload);
        return flattenI18n({
            id: updated.id,
            slug: updated.slug,
            title: updated.title,
            titleI18n: updated.titleI18n,
            createdAt: updated.createdAt,
        }, "titleI18n", DEFAULT_LANGUAGES);
    };

    const handleCreate = async (data: Record<string, any>) => {
        const payload = {
            slug: data.slug,
            title: data.title,
            ...unflattenI18n(data, "titleI18n", DEFAULT_LANGUAGES),
        };
        
        const created = await createArtifactCategory(payload);
        return flattenI18n({
            id: created.id,
            slug: created.slug,
            title: created.title,
            titleI18n: created.titleI18n,
            createdAt: created.createdAt,
        }, "titleI18n", DEFAULT_LANGUAGES);
    };

    const handleDelete = async (id: string) => {
        await deleteArtifactCategory(id);
    };

    // Transform categories to include flat fields for editing
    const transformedCategories = categories.map((cat) => flattenI18n(cat, "titleI18n", DEFAULT_LANGUAGES));

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
            <InlineEditableTable
                items={transformedCategories}
                columns={columns}
                onSave={handleSave}
                onCreate={handleCreate}
                onDelete={handleDelete}
                newItemLabel="Click to add new category..."
            />
        </div>
    );
}
