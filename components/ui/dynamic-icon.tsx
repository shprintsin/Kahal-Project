import * as LucideIcons from "lucide-react"
import {
  ArrowLeft,
  Archive,
  BookOpen,
  ChevronDown,
  Code,
  Coins,
  Database,
  FileSpreadsheet,
  Github,
  Home,
  Landmark,
  Map,
  Search,
  Users,
} from "lucide-react"

const LEGACY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FaSearch: Search,
  FaHome: Home,
  FaBook: BookOpen,
  FaDatabase: Database,
  FaArchive: Archive,
  FaChevronDown: ChevronDown,
  FaArrowLeft: ArrowLeft,
  FaFileExcel: FileSpreadsheet,
  FaCoins: Coins,
  FaUsers: Users,
  FaLandmark: Landmark,
  FaMap: Map,
  FaGithub: Github,
  FaCode: Code,
}

interface DynamicIconProps {
  icon: string
  className?: string
}

export function DynamicIcon({ icon, className = "" }: DynamicIconProps) {
  const LucideIcon = (LucideIcons as any)[icon]
  if (LucideIcon) {
    return <LucideIcon className={className} />
  }

  const LegacyIcon = LEGACY_ICONS[icon]
  if (LegacyIcon) {
    return <LegacyIcon className={className} />
  }

  return null
}
