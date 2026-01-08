"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LoopStyleEditor,
  UnifiedCanvas,
  UnifiedCanvasSeparator,
  FileTree,
  ContentLanguageProvider,
  useContentLanguage,
  EditorContextMenu,
  JsonDropzone,
  SidebarCard,
  SidebarField,
  StatusDot
} from "@/app/admin/components/content";
import { ContentLanguage as PrismaContentLanguage } from "@prisma/client";

import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createDocument, updateDocument } from "@/app/admin/actions/documents";
import { PageEditDialog } from "@/app/admin/editors/page-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, FileText, Hash, Calendar, Globe, Link as LinkIcon, Download } from "lucide-react";

interface DocumentEditorClientProps {
  document: any;
  documents: any[];
  isNew: boolean;
}

function EditorInner({ document, documents, isNew }: DocumentEditorClientProps) {
  const router = useRouter();
  const documentId = document?.id;

  const {
    currentLanguage,
    setLanguage,
    setTranslations,
  } = useContentLanguage();

  // Form state
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  // Document specific metadata
  const [category, setCategory] = React.useState(document?.category || "");
  const [year, setYear] = React.useState<number | "">(document?.year || "");
  const [reference, setReference] = React.useState(document?.reference || "");
  const [referenceUrl, setReferenceUrl] = React.useState(document?.referenceUrl || "");
  const [scanUrl, setScanUrl] = React.useState(document?.scanUrl || "");
  const [scanZip, setScanZip] = React.useState(document?.scanZip || "");
  // Use explicit string or Prisma type for document language
  const [docLang, setDocLang] = React.useState<PrismaContentLanguage>((document?.lang as PrismaContentLanguage) || "PL");
  // @ts-ignore
  const [status, setStatus] = React.useState<ContentStatus>(document?.status || "draft");
  const [license, setLicense] = React.useState(document?.license || "");
  const [volume, setVolume] = React.useState(document?.volume || "");
  
  // Pages
  const [pages, setPages] = React.useState<any[]>(document?.pages || []);
  const [editingPage, setEditingPage] = React.useState<any>(null);

  // Initialize data
  React.useEffect(() => {
    if (document) {
      // Set translations for PL (default/primary)
      setTranslations('pl', {
        title: document.title || "",
        slug: document.slug || "",
        description: document.description || ""
      });
      // Set translations for EN
      setTranslations('en', {
        title: document.titleEn || "",
        slug: document.slug || "",
        description: document.descriptionEn || ""
      });
      // Set translations for HE (if any)
      setTranslations('he', {
         // Assuming fallback or separate fields if they existed, but for now just mirroring or empty
         slug: document.slug || ""
      });
    }
  }, [documentId]);

  // We need to access context values to get proper translations for save
  // Since we are inside the component, we can just use useContentLanguage() hooks but we already destructured some.
  // We need 'translations' object from the hook.
  const { translations, updateField } = useContentLanguage();

  // Read current language values for UI binding
  const title = (translations[currentLanguage]?.title as string) || "";
  const slug = (translations[currentLanguage]?.slug as string) || "";
  const description = (translations[currentLanguage]?.description as string) || "";
  
  const handleFieldChange = (field: string, value: string) => {
      updateField(field, value);
      setIsDirty(true);
  };

  const handleMetadataChange = (setter: Function, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  const handleFileUpload = (data: any) => {
    let newPages: any[] = [];
    if (Array.isArray(data)) {
      newPages = data;
    } else if (data.pages && Array.isArray(data.pages)) {
      newPages = data.pages;
    }

    if (newPages.length > 0) {
      const mapped = newPages.map((p: any, i) => ({
        index: i,
        content: p.content || "",
        contentHe: p.contentHe || p.he || "", // Maps 'en', 'he' from JSON
        contentEn: p.contentEn || p.en || "",
        filename: p.file || p.filename
      }));
      setPages(mapped);
      setIsDirty(true);
      toast.success(`Loaded ${mapped.length} pages from JSON`);
    } else {
      toast.error("No valid pages found in JSON");
    }
  };

  const handlePageUpdate = (page: any) => {
    const currentPages = [...pages];
    const idx = currentPages.findIndex(p => p.index === page.index);
    if (idx >= 0) {
      currentPages[idx] = page;
    }
    setPages(currentPages);
    setIsDirty(true);
    setEditingPage(null);
  };

  const prepareData = () => {
     const titleEn = translations['en']?.title as string | undefined;
     const descriptionEn = translations['en']?.description as string | undefined;
     
     // Default (primary) values - prefer PL as it seems to be the primary language logic or whatever docLang is?
     // Actually, let's assume 'pl' holds the primary title based on our Effect.
     // If 'pl' title is empty, maybe fallback to current language title?
     const titlePrimary = (translations['pl']?.title as string) || (translations['en']?.title as string) || ""; 
     const descPrimary = (translations['pl']?.description as string) || (translations['en']?.description as string) || "";
     const finalSlug = (translations['pl']?.slug as string) || (translations['en']?.slug as string) || "";

     return {
        title: titlePrimary,
        titleEn,
        slug: finalSlug,
        description: descPrimary,
        descriptionEn: descriptionEn,
        category,
        year: year === "" ? undefined : Number(year),
        reference,
        referenceUrl,
        scanUrl,
        scanZip,
        lang: docLang,
        status,
        license,
        volume,
        pages: pages.map(p => ({
            index: p.index,
            content: p.content,
            contentHe: p.contentHe,
            contentEn: p.contentEn,
            filename: p.filename,
        }))
     };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = prepareData();

      if (isNew) {
        const res = await createDocument(data);
        if (res.success && res.data) {
          toast.success("Document created");
          router.push(`/admin/documents/${res.data.id}`);
        } else {
          toast.error(res.error || "Failed to create");
        }
      } else {
        const res = await updateDocument({ id: documentId, ...data });
        if (res.success) {
          toast.success("Document updated");
          setIsDirty(false);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update");
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true); // Just visual state, logical flow is same as save but with status=published
    setStatus("published");
    // We defer actual save to next render or force it now. 
    // Ideally we update state then save. 
    // Quick fix: call save logic with explicit status
    try {
        const data = { ...prepareData(), status: "published" as ContentStatus };
        if (isNew) {
            const res = await createDocument(data);
            if (res.success && res.data) {
                toast.success("Published!");
                router.push(`/admin/documents/${res.data.id}`);
            } else {
                toast.error(res.error || "Failed to publish");
            }
        } else {
            const res = await updateDocument({ id: documentId, ...data });
             if (res.success) {
                toast.success("Published!");
                setIsDirty(false);
                router.refresh();
            } else {
                toast.error(res.error || "Failed to update");
            }
        }
    } catch (e) {
        toast.error("Publish failed");
    } finally {
        setPublishing(false);
    }
  };

  // File Tree
  const fileTreeItems: FileTreeItem[] = React.useMemo(() => {
    return documents.slice(0, 50).map((d: any) => ({
      id: d.id,
      name: d.title || d.slug || "Untitled",
      slug: d.slug,
      type: "file" as const,
      path: `/admin/documents/${d.id}`,
      status: d.status,
    }));
  }, [documents]);

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={documentId}
      onFileSelect={(item) => item.path && router.push(item.path)}
      onFileCreate={() => router.push("/admin/documents/new")}
    />
  );

  // Sidebar
  const sidebar = (
    <div className="space-y-4">
        {/* Status Card */}
        <SidebarCard title="Status & Visibility">
            <SidebarField label="Status">
                 <div className="flex bg-muted/30 p-1 rounded-md">
                    {(["draft", "published", "archived"] as ContentStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleMetadataChange(setStatus, s)}
                            className={`flex-1 text-xs py-1.5 px-2 rounded-sm capitalize transition-all ${
                                status === s 
                                    ? "bg-background shadow text-foreground font-medium" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                 </div>
            </SidebarField>
            {document && (
                <>
                <SidebarField label="Created">
                    <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 opacity-50"/>
                        {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                </SidebarField>
                <SidebarField label="Updated">
                     <div className="flex items-center gap-2 text-xs">
                        <Edit className="w-3 h-3 opacity-50"/>
                        {new Date(document.updatedAt).toLocaleDateString()}
                    </div>
                </SidebarField>
                </>
            )}
        </SidebarCard>

        {/* Metadata Card */}
        <SidebarCard title="Metadata">
            <SidebarField label="Category">
                <div className="flex items-center bg-muted/30 rounded-md px-2 py-1.5 border border-transparent focus-within:border-primary/20 transition-colors">
                    <Hash className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <input 
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
                        placeholder="e.g. History"
                        value={category}
                        onChange={(e) => handleMetadataChange(setCategory, e.target.value)}
                    />
                </div>
            </SidebarField>
            <SidebarField label="Year">
                 <div className="flex items-center bg-muted/30 rounded-md px-2 py-1.5 border border-transparent focus-within:border-primary/20 transition-colors">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <input 
                        type="number"
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
                        placeholder="YYYY"
                        value={year}
                        onChange={(e) => handleMetadataChange(setYear, e.target.value)}
                    />
                </div>
            </SidebarField>
            <SidebarField label="Volume">
                 <div className="flex items-center bg-muted/30 rounded-md px-2 py-1.5 border border-transparent focus-within:border-primary/20 transition-colors">
                    <FileText className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <input 
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
                        placeholder="Vol 1..."
                        value={volume}
                        onChange={(e) => handleMetadataChange(setVolume, e.target.value)}
                    />
                </div>
            </SidebarField>
             <SidebarField label="Document Language">
                 <div className="flex items-center bg-muted/30 rounded-md px-2 py-1.5 border border-transparent focus-within:border-primary/20 transition-colors">
                    <Globe className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <select
                        className="bg-transparent border-none outline-none text-sm w-full cursor-pointer"
                        value={docLang}
                        onChange={(e) => handleMetadataChange(setDocLang, e.target.value)}
                    >
                        <option value="PL">Polish</option>
                        <option value="EN">English</option>
                        <option value="HE">Hebrew</option>
                    </select>
                </div>
            </SidebarField>
        </SidebarCard>

        {/* References Card */}
        <SidebarCard title="References & Files">
            <SidebarField label="Reference Name">
                 <Input 
                    className="h-8 text-xs bg-muted/30 border-transparent focus:border-primary/20" 
                    placeholder="Source name..."
                    value={reference}
                    onChange={(e) => handleMetadataChange(setReference, e.target.value)}
                 />
            </SidebarField>
             <SidebarField label="Reference URL">
                 <div className="flex items-center gap-2">
                     <LinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                     <Input 
                        className="h-8 text-xs bg-muted/30 border-transparent focus:border-primary/20" 
                        placeholder="https://..."
                        value={referenceUrl}
                        onChange={(e) => handleMetadataChange(setReferenceUrl, e.target.value)}
                     />
                 </div>
            </SidebarField>
             <SidebarField label="Scan URL">
                  <div className="flex items-center gap-2">
                     <Download className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                     <Input 
                        className="h-8 text-xs bg-muted/30 border-transparent focus:border-primary/20" 
                        placeholder="https://...pdf"
                        value={scanUrl}
                        onChange={(e) => handleMetadataChange(setScanUrl, e.target.value)}
                     />
                 </div>
            </SidebarField>
             <SidebarField label="License">
                 <Input 
                    className="h-8 text-xs bg-muted/30 border-transparent focus:border-primary/20" 
                    placeholder="CC-BY, Public Domain..."
                    value={license}
                    onChange={(e) => handleMetadataChange(setLicense, e.target.value)}
                 />
            </SidebarField>
        </SidebarCard>
    </div>
  );

  return (
    <LoopStyleEditor
        backHref="/admin/documents"
        backLabel="Documents"
        onBack={() => router.push("/admin/documents")}
        onSave={handleSave}
        onPublish={handlePublish}
        saving={saving}
        publishing={publishing}
        isDirty={isDirty}
        currentLanguage={currentLanguage}
        onLanguageChange={setLanguage}
        showLanguageToggle={true}
        fileTree={fileTree}
        sidebar={sidebar}
    >
        <EditorContextMenu onAction={(action) => toast.info(`Action: ${action}`)}>
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
                 <UnifiedCanvas
                    title={title}
                    onTitleChange={(v) => handleFieldChange("title", v)}
                    slug={slug}
                    onSlugChange={(v) => handleFieldChange("slug", v)}
                    slugPrefix="/documents/"
                    description={description}
                    onDescriptionChange={(v) => handleFieldChange("description", v)}
                    content="" 
                    onContentChange={() => {}} // Content is handled in pages for documents
                    contentPlaceholder="" // No main content body, using pages
                />

                <UnifiedCanvasSeparator label={`Document Pages (${pages.length})`} />
                
                {/* Pages Dropzone */}
                <div className="px-1">
                    <JsonDropzone 
                        onFileLoaded={handleFileUpload} 
                        compact={pages.length > 0}
                        label="Drop 'pages.json' here to import"
                    />
                </div>

                {/* Pages List */}
                {pages.length > 0 && (
                     <div className="grid gap-2 px-1">
                        {pages.map((page: any, idx: number) => (
                            <div 
                                key={idx} 
                                className="group flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-card hover:border-border/80 transition-all cursor-pointer"
                                onClick={() => setEditingPage(page)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-muted text-xs font-mono text-muted-foreground">
                                        {page.index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{page.filename || "Untitled Page"}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {page.content ? page.content.substring(0, 50) + "..." : "No content"}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EditorContextMenu>

        {editingPage && (
            <PageEditDialog
                open={!!editingPage}
                onOpenChange={(open) => !open && setEditingPage(null)}
                page={editingPage}
                onSave={handlePageUpdate}
            />
        )}

    </LoopStyleEditor>
  );
}

export function DocumentEditorClient(props: DocumentEditorClientProps) {
    return (
        <ContentLanguageProvider defaultLanguage="pl">
            <EditorInner {...props} />
        </ContentLanguageProvider>
    )
}
