import { cx } from 'class-variance-authority'
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { Button } from "@/app/components/ui/button"
import { Children, Fragment } from "react";
import { LucideIcon } from "lucide-react"; // Assuming lucide-react

// 1. The Container: Handles general layout, font size, and color
export const MetaRow = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  // We use Children.toArray to easily insert separators between items
  const arrayChildren = Children.toArray(children);
  return (
    <div className={`flex items-center text-sm text-gray-500 mb-6 ${className}`}>
      {arrayChildren.map((child, index) => (
        <Fragment key={index}>
          {child}
          {/* Automatically add separator if it's not the last item */}
          {index < arrayChildren.length - 1 && (
            <span className="mx-2 select-none">•</span>
          )}
        </Fragment>
      ))}
    </div>
  );
};

// 2. The Item: Handles Icon + Text pairing
interface MetaItemProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  href?: string;
}

export const MetaItem = ({ icon: Icon, children, href }: MetaItemProps) => {
  const content = (
    <div className="flex items-center">
      {Icon && <Icon className="h-4 w-4 ml-1" />} {/* changed ml-1 to mr-2 for better spacing */}
      <span>{children}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:underline hover:text-[#0d4d2c] transition-colors">
        {content}
      </Link>
    );
  }

  return content;
};


export const ButtonIcons = ({children, className}: {children: ReactNode, className?: string}) => {
  return (
      <Button className={cn("bg-[#0d4d2c] hover:bg-[#083d22]",className)} 
      >
                 
                    {children}
                  </Button>
  )
}


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
    
  <h1 className={`font-bold secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8 ${className ?? ""}`} > {children} </h1>
);
;


const MetaDataIcons = ({children,className,content}: {children: ReactNode, className?:string,content?:string}) => {
  return (
    <div className={cx("flex items-center text-sm text-gray-500 mb-6",className)}>{children}
    <span>{content}</span>
    </div>
  )
}
export default MetaDataIcons
export const PageSubtitle =({children,className}: {children: ReactNode, className?:string})=> (
    <p className={cx("text-xl text-gray-600 mb-4",className)}>{children}</p>
)
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

export const SectionTitle = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <h2 className={cx("text-right font-bold mb-8 secular text-4xl text-emerald-900",className)}>
            {children}
        </h2>
    )
}
export const SectionSubTitle = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <h2 className={cx("text-right mb-4 secular font-bold text-3xl text-emerald-900",className)}>
            {children}
        </h2>
    )
}


export const NoteCard = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <div className={cx("mt-8 bg-gray-100 w-full shadow-sm p-8 flex flex-col",className)}>
          {children}           
        </div>
    )
}

export const SeeMoreButton = ({children,className}: {children: React.ReactNode, className?:string}) =>        (   <a href="#"
 className={cx("flex justify-end items-center gap-2 font-bold mt-6 text-xl",className)}>
<h2>{children}</h2>
<FaArrowLeft/>
</a>

)
export const Section = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <div className={cx("bg-white shadow-sm p-8 flex flex-col",className)}>
            {children}
        </div>
    )
}

export const RowSection = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <div className={cx("bg-white shadow-sm p-8 flex flex-row",className)}>
            {children}
        </div>
    )
}
{/* <article key={post.id} className="bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 h-full">
                  <h3 className="text-xl font-['Secular_One'] text-gray-800">{post.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">{post.excerpt}</p>
                  <div className="flex justify-between text-gray-500 text-sm mt-auto">
                    <span>{post.date}</span>
                    <span>{post.author}</span>
                  </div>
                </div>
              </article> */}

export const Card = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <div className={cx("bg-white shadow-sm p-6 flex flex-col",className)}>
            {children}
        </div>
    )
}

export const CardHeader = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <h3 className={cx("text-xl font-['Secular_One'] text-gray-800",className)}>{children}</h3>
    )
}

export const CardContent = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <p className={cx("text-gray-600 leading-relaxed flex-grow",className)}>{children}</p>
    )
}

export const CardFooter = ({children,className}: {children: React.ReactNode, className?:string}) => {
    return (
        <div className={cx("flex justify-between text-gray-500 text-sm mt-auto",className)}>{children}</div>
    )
}

