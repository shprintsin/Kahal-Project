"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Pencil } from "lucide-react";

interface AdminToolbarContextValue {
  editUrl: string | null;
  setEditUrl: (url: string | null) => void;
}

const AdminToolbarContext = createContext<AdminToolbarContextValue>({
  editUrl: null,
  setEditUrl: () => {},
});

interface AdminToolbarUser {
  name?: string | null;
  email?: string | null;
}

interface AdminToolbarProviderProps {
  children: ReactNode;
  user: AdminToolbarUser | null;
}

export function AdminToolbarProvider({
  children,
  user,
}: AdminToolbarProviderProps) {
  const [editUrl, setEditUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setEditUrl(null);
  }, [pathname]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <AdminToolbarContext.Provider value={{ editUrl, setEditUrl }}>
      <AdminToolbarInner user={user}>{children}</AdminToolbarInner>
    </AdminToolbarContext.Provider>
  );
}

function AdminToolbarInner({ user, children }: { user: AdminToolbarUser; children: ReactNode }) {
  const pathname = usePathname();
  const { editUrl } = useContext(AdminToolbarContext);
  const isHidden = pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (isHidden) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 h-8 bg-zinc-900 text-zinc-200 text-xs flex items-center justify-between px-4 shadow-md"
        dir="ltr"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          {editUrl && (
            <Link
              href={editUrl}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">{user.name || user.email}</span>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </>
  );
}

export function SetEditUrl({ url }: { url: string }) {
  const { setEditUrl } = useContext(AdminToolbarContext);
  const stableSetEditUrl = useCallback(setEditUrl, [setEditUrl]);

  useEffect(() => {
    stableSetEditUrl(url);
    return () => stableSetEditUrl(null);
  }, [url, stableSetEditUrl]);

  return null;
}
