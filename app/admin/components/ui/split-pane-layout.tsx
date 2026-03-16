import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SplitPaneLayoutProps {
  sidebarTitle: string;
  sidebarAction?: React.ReactNode;
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SplitPaneLayout({
  sidebarTitle,
  sidebarAction,
  sidebarContent,
  children,
  className,
}: SplitPaneLayoutProps) {
  return (
    <div className={cn("flex h-[calc(100vh-4rem)]", className)}>
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="font-semibold text-lg">{sidebarTitle}</h2>
          {sidebarAction}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">{sidebarContent}</div>
        </ScrollArea>
      </div>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
