import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AuthorCardProps {
  name: string
  role: string
  affiliation: string
  className?: string
}

export function AuthorCard({ name, role, affiliation, className }: AuthorCardProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="w-9 h-9 bg-surface-brand-light">
        <AvatarFallback className="bg-surface-brand-light text-brand-primary">
          <Users className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-semibold text-foreground text-sm truncate">{name}</div>
        <div className="text-xs text-muted-foreground truncate">{role} · {affiliation}</div>
      </div>
    </div>
  )
}
