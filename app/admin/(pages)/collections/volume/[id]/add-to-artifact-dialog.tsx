"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from "@/components/ui/accordion";
import { Check, ChevronsRight, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { 
    getArtifactsStructured, 
    addPagesToArtifact, 
    createArtifact 
} from "@/app/admin/actions/artifacts";
import { getCategories } from "@/app/admin/actions/categories";

// Simple slugify
const slugify = (text: string) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

interface AddToArtifactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pageIds: string[];
    onSuccess?: () => void;
}

export default function AddToArtifactDialog({
    open,
    onOpenChange,
    pageIds,
    onSuccess
}: AddToArtifactDialogProps) {
    const [activeTab, setActiveTab] = useState("existing");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data for Existing Tab
    const [structure, setStructure] = useState<{ categories: any[], uncategorized: any[] }>({ categories: [], uncategorized: [] });
    const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

    // Data for New Tab
    const [newTitle, setNewTitle] = useState("");
    const [newTitleI18n, setNewTitleI18n] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCategoryId, setNewCategoryId] = useState<string>("uncategorized");
    const [allCategories, setAllCategories] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    // Auto-generate slug
    useEffect(() => {
        if (newTitle && !newSlug) {
            setNewSlug(slugify(newTitle));
        }
    }, [newTitle, newSlug]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const struct = await getArtifactsStructured();
            setStructure(struct);
            
            // Re-use categories from structure if possible, or fetch separate if structure format is different
            // Structure has categories with artifacts. We might want just list of categories for the "New" dropdown.
            // Let's reuse or fetch.
            const cats = await getCategories();
            setAllCategories(cats);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load artifacts");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToExisting = async () => {
        if (!selectedArtifactId) {
            toast.error("Please select an artifact");
            return;
        }
        setSubmitting(true);
        try {
            await addPagesToArtifact(selectedArtifactId, pageIds);
            toast.success("Pages added to artifact");
            onOpenChange(false);
            onSuccess?.();
            setSelectedArtifactId(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to add pages");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateNew = async () => {
        if (!newTitle || !newSlug) {
            toast.error("Title and Slug are required");
            return;
        }
        setSubmitting(true);
        try {
            const artifact = await createArtifact({
                title: newTitle,
                titleI18n: { he: newTitleI18n }, // Simple assumption for now
                slug: newSlug,
                description: newDesc,
                artifactCategoryId: newCategoryId === "uncategorized" ? undefined : newCategoryId,
                content: "",
                contentI18n: {},
                pageIds: pageIds,
                // defaults for others
                displayScans: true,
                displayTexts: true,
            });
            
            toast.success("Artifact created and pages added");
            onOpenChange(false);
            onSuccess?.();
            
            // Reset form
            setNewTitle("");
            setNewTitleI18n("");
            setNewSlug("");
            setNewDesc("");
            setNewCategoryId("uncategorized");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create artifact");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add {pageIds.length} Page{pageIds.length !== 1 ? 's' : ''} to Artifact</DialogTitle>
                    <DialogDescription>
                        Select an existing artifact or create a new one to organize these pages.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">Add to Existing</TabsTrigger>
                        <TabsTrigger value="new">Create New</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 min-h-0 relative my-4 border rounded-md">
                        {/* EXISTING TAB */}
                        <TabsContent value="existing" className="absolute inset-0 overflow-hidden flex flex-col m-0 p-0 border-0">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ScrollArea className="flex-1 p-4">
                                    {structure.categories.length === 0 && structure.uncategorized.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No artifacts found. Create a new one.
                                        </div>
                                    )}

                                    <Accordion type="multiple" className="w-full">
                                        {structure.categories.map((cat) => (
                                            <AccordionItem key={cat.id} value={cat.id}>
                                                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                                                    {cat.title}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="flex flex-col gap-1 pl-4">
                                                        {cat.artifacts.map((art: any) => (
                                                            <button
                                                                key={art.id}
                                                                onClick={() => setSelectedArtifactId(art.id)}
                                                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedArtifactId === art.id 
                                                                    ? "bg-primary text-primary-foreground" 
                                                                    : "hover:bg-muted"
                                                                }`}
                                                            >
                                                                <span>{art.title || art.slug}</span>
                                                                {selectedArtifactId === art.id && <Check className="w-4 h-4" />}
                                                            </button>
                                                        ))}
                                                        {cat.artifacts.length === 0 && (
                                                            <span className="text-muted-foreground text-xs italic px-3">No artifacts</span>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    {structure.uncategorized.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2 px-1">Uncategorized</h4>
                                            <div className="flex flex-col gap-1">
                                                {structure.uncategorized.map((art: any) => (
                                                    <button
                                                        key={art.id}
                                                        onClick={() => setSelectedArtifactId(art.id)}
                                                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                                            selectedArtifactId === art.id 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "hover:bg-muted"
                                                        }`}
                                                    >
                                                        <span>{art.title || art.slug}</span>
                                                        {selectedArtifactId === art.id && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            )}
                        </TabsContent>

                        {/* NEW TAB */}
                        <TabsContent value="new" className="absolute inset-0 overflow-auto flex flex-col m-0 p-4 border-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title (Primary)</Label>
                                    <Input 
                                        id="title" 
                                        value={newTitle} 
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Letter to the Mayor"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title_he">Title (Hebrew/Other)</Label>
                                    <Input 
                                        id="title_he" 
                                        value={newTitleI18n} 
                                        onChange={(e) => setNewTitleI18n(e.target.value)}
                                        placeholder="e.g. מכתב לראש העיר"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input 
                                        id="slug" 
                                        value={newSlug} 
                                        onChange={(e) => setNewSlug(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                            {allCategories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea 
                                        id="desc" 
                                        value={newDesc} 
                                        onChange={(e) => setNewDesc(e.target.value)} 
                                        className="h-24 resize-none"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    <DialogFooter>
                         <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                         {activeTab === "existing" ? (
                             <Button onClick={handleAddToExisting} disabled={!selectedArtifactId || submitting}>
                                 {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                 Add to Artifact
                             </Button>
                         ) : (
                             <Button onClick={handleCreateNew} disabled={!newTitle || submitting}>
                                 {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                 Create & Add
                             </Button>
                         )}
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
