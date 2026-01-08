import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type H3Props = {
  children: ReactNode;
  className?: string;
};


type ReadMoreProps = {
  children: ReactNode;
  className?: string;
  href: string;
}

export const H3 = ({ children, className }: H3Props) => (
  <h3 className={`secular text-xl text-[var(--dark-green)] mb-4 ${className ?? ""}`} > {children} </h3>
);
;
export const PageTitle = ({ children, className }: H3Props) => (
    
  <h1 className={`secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 ${className ?? ""}`} > {children} </h1>
);
;

export const LinkTitle = ({ children, className, href }: { children: ReactNode; className?: string; href: string }) => (
    <Link href={href} className="secular text-2xl text-[var(--dark-green)] mb-3">{children}</Link>
);

export const ReadMore = ({ children, className, href }: ReadMoreProps) => (
  <a href={href} className={`flex justify-between items-center text-[#5c6d3f] hover:text-[var(--dark-green)] transition-colors duration-200 ${className ?? ""}`} > <span className="secular font-bold">{children}</span> <ArrowLeft className="h-5 w-5" /> </a>
);



export function Row({className, children}: {className?: string, children: React.ReactNode}) {
  return (
    <div className={cn("flex flex-row", className)}>
      {children}
    </div>
  )
}

export function Col({className, children}: {className?: string, children: React.ReactNode}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
      </div>
  )
}
