"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createRegion, updateRegion, deleteRegion } from "../actions/regions";
import { useRouter } from "next/navigation";
import { ConfiguredTable, TableColumn } from "@/app/admin/components/tables/configured-table";
import { codeCell, rightActions } from "@/app/admin/components/tables/table-utils";

interface Region {
    id: string;
    slug: string;
    name: string | null;
    nameI18n: any;
}

export default function RegionsClient({ initialRegions }: { initialRegions: any[] }) {
    const router = useRouter();
    const [regions, setRegions] = useState<Region[]>(initialRegions);
    const [submitting, setSubmitting] = useState(false);
    
    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
    });

    const columns: TableColumn<Region>[] = [
        {
            id: "name",
            header: "Name",
            render: (region) => <span className="font-medium">{region.name || region.slug}</span>,
        },
        { id: "slug", header: "Slug", render: (region) => codeCell(region.slug) },
        {
            id: "actions",
            header: <span className="text-right block">Actions</span>,
            render: (region) => rightActions(
                <>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(region)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(region.id)}>
                        <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                </>
            ),
            align: "right",
        },
    ];

    const openCreate = () => {
        setEditingRegion(null);
        setFormData({ name: "", slug: "" });
        setDialogOpen(true);
    };

    const openEdit = (region: Region) => {
        setEditingRegion(region);
        setFormData({
            name: region.name || "",
            slug: region.slug,
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const data = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            };

            if (editingRegion) {
                await updateRegion(editingRegion.id, data);
                toast.success("Region updated");
            } else {
                await createRegion(data);
                toast.success("Region created");
            }
            setDialogOpen(false);
            router.refresh();
        } catch (e) {
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteRegion(id);
            toast.success("Region deleted");
            router.refresh();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Region
                </Button>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <ConfiguredTable
                    data={regions}
                    columns={columns}
                    emptyText="No regions found."
                    rowKey={(region) => region.id}
                />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRegion ? "Edit Region" : "Create Region"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Slug</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                         <Button onClick={handleSubmit} disabled={submitting || !formData.name}>
                             {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                             Save
                         </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
