"use client";

import Link from "next/link";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Folder, Book } from "lucide-react";
import Image from "next/image";
import { getOptimizedImageUrl, ImagePresets } from "@/lib/image-utils";

type EntityType = "COLLECTION" | "SERIES" | "VOLUME";

interface EntityGridProps {
  items: {
    id: string;
    type: EntityType;
    name: string;
    thumbnailUrl?: string | null;
    childCount?: number;
    href: string;
  }[];
}

export default function EntityGrid({ items }: EntityGridProps) {
  if (items.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No items found.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {items.map((item) => (
        <EntityCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function EntityCard({ item }: { item: EntityGridProps["items"][0] }) {
    // If we already have a full URL (R2), we can pass it to Next.js Image 
    // BUT we shouldn't pre-optimize it with getOptimizedImageUrl if we are feeding it to <Image>
    // <Image> handles the optimization.
    // So we just pass the raw R2 URL to src.
    
    return (
        <Link href={item.href} className="block group h-full">
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all h-full flex flex-col">
                 <div className="aspect-[4/3] relative bg-muted flex items-center justify-center overflow-hidden">
                     {item.thumbnailUrl ? (
                         <Image 
                            src={item.thumbnailUrl} 
                            alt={item.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-300" 
                            sizes="(max-width: 768px) 50vw, 20vw"
                         />
                     ) : (
                         <IconPlaceholder type={item.type} />
                     )}
                 </div>
                 <CardFooter className="p-3 border-t bg-card h-16 flex items-center">
                     <div className="w-full min-w-0">
                        <h3 className="font-medium text-sm truncate" title={item.name}>{item.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{item.childCount ?? 0} {item.type === 'SERIES' ? 'Volumes' : 'Items'}</p>
                     </div>
                 </CardFooter>
            </Card>
        </Link>
    )
}

function IconPlaceholder({ type }: { type: EntityType }) {
    if (type === "SERIES") return <Folder className="w-16 h-16 text-muted-foreground/50" />;
    if (type === "VOLUME") return <Book className="w-16 h-16 text-muted-foreground/50" />;
    return <Folder className="w-16 h-16 text-muted-foreground/50" />;
}
