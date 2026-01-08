"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Search, Loader2 } from "lucide-react";
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
import { createPlace, updatePlace, deletePlace, searchPlaces } from "../actions/places";
import { useRouter } from "next/navigation";
import { ConfiguredTable, TableColumn } from "@/app/admin/components/tables/configured-table";
import { codeCell, mutedCell, rightActions } from "@/app/admin/components/tables/table-utils";

interface Place {
    id: string;
    geoname: string;
    geocode: string;
    countryCode: string;
    admin1: string | null;
    admin2: string | null;
    lat: number | null;
    lon: number | null;
}

export default function PlacesClient({ initialPlaces }: { initialPlaces: any[] }) {
    const router = useRouter();
    const [places, setPlaces] = useState<Place[]>(initialPlaces);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [formData, setFormData] = useState({
        geoname: "",
        countryCode: "",
        admin1: "",
        admin2: "",
        lat: "",
        lon: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        try {
            if (!searchQuery.trim()) {
                setPlaces(initialPlaces); // This is static initial, ideally re-fetch all?
                // For simplicity, just reload page or fetch all.
                // But getPlaces was server side. Check actions.
                router.refresh(); // This refreshes server component but doesn't pass new props to client instantly unless we stream
                // Let's rely on search action
                return;
            }
            const response = await searchPlaces(searchQuery);
            setPlaces(response.results as any);

        } finally {
            setSearching(false);
        }
    };

    const openCreate = () => {
        setEditingPlace(null);
        setFormData({ geoname: "", countryCode: "", admin1: "", admin2: "", lat: "", lon: "" });
        setDialogOpen(true);
    };

    const openEdit = (place: Place) => {
        setEditingPlace(place);
        setFormData({
            geoname: place.geoname,
            countryCode: place.countryCode,
            admin1: place.admin1 || "",
            admin2: place.admin2 || "",
            lat: place.lat?.toString() || "",
            lon: place.lon?.toString() || ""
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const data = {
                geoname: formData.geoname,
                countryCode: formData.countryCode,
                admin1: formData.admin1 || undefined,
                admin2: formData.admin2 || undefined,
                lat: formData.lat ? parseFloat(formData.lat) : undefined,
                lon: formData.lon ? parseFloat(formData.lon) : undefined
            };

            if (editingPlace) {
                await updatePlace(editingPlace.id, data);
                toast.success("Place updated");
            } else {
                await createPlace(data);
                toast.success("Place created");
            }
            setDialogOpen(false);
            router.refresh();
        } catch (e) {
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const columns: TableColumn<Place>[] = [
        { id: "geoname", header: "Geoname", render: (place) => <span className="font-medium">{place.geoname}</span> },
        { id: "geocode", header: "Slug (Geocode)", render: (place) => codeCell(place.geocode) },
        { id: "country", header: "Country", render: (place) => codeCell(place.countryCode) },
        { id: "admin1", header: "Admin1", render: (place) => mutedCell(place.admin1 || "-") },
        { id: "admin2", header: "Admin2", render: (place) => mutedCell(place.admin2 || "-") },
        {
            id: "actions",
            header: <span className="text-right block">Actions</span>,
            render: (place) => rightActions(
                <>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(place)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(place.id)}>
                        <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                </>
            ),
            align: "right",
        },
    ];

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deletePlace(id);
            toast.success("Place deleted");
            // Optimistic update or refresh
            setPlaces(places.filter(p => p.id !== id));
            router.refresh();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
                    <Input 
                        placeholder="Search places..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" variant="ghost" size="icon">
                        {searching ? <Loader2 className="animate-spin w-4 h-4"/> : <Search className="w-4 h-4" />}
                    </Button>
                </form>
                <div className="flex-1 text-right">
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Place
                    </Button>
                </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <ConfiguredTable
                    data={places}
                    columns={columns}
                    emptyText="No places found."
                    rowKey={(place) => place.id}
                />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPlace ? "Edit Place" : "Create Place"}</DialogTitle>
                        <DialogDescription>
                             {editingPlace ? "Modify place details." : "Add a new place. Slug will be auto-generated."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Geoname</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.geoname}
                                onChange={(e) => setFormData({...formData, geoname: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Country Code</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.countryCode}
                                onChange={(e) => setFormData({...formData, countryCode: e.target.value.substring(0, 3).toUpperCase()})}
                                placeholder="POL, USA, etc."
                                maxLength={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Admin 1</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.admin1}
                                onChange={(e) => setFormData({...formData, admin1: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Admin 2</Label>
                            <Input 
                                className="col-span-3" 
                                value={formData.admin2}
                                onChange={(e) => setFormData({...formData, admin2: e.target.value})}
                            />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Lat</Label>
                            <Input 
                                className="col-span-3" 
                                type="number"
                                value={formData.lat}
                                onChange={(e) => setFormData({...formData, lat: e.target.value})}
                            />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Lon</Label>
                            <Input 
                                className="col-span-3" 
                                type="number"
                                value={formData.lon}
                                onChange={(e) => setFormData({...formData, lon: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                         <Button onClick={handleSubmit} disabled={submitting || !formData.geoname || !formData.countryCode}>
                             {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                             Save
                         </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
