import * as LucideIcons from "lucide-react"
import {
  FaSearch,
  FaHome,
  FaBook,
  FaDatabase,
  FaArchive,
  FaChevronDown,
  FaArrowLeft,
  FaFileExcel,
} from "react-icons/fa"
import { FaCoins, FaUsers, FaLandmark, FaMap } from "react-icons/fa"

const FA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FaSearch,
  FaHome,
  FaBook,
  FaDatabase,
  FaArchive,
  FaChevronDown,
  FaArrowLeft,
  FaFileExcel,
  FaCoins,
  FaUsers,
  FaLandmark,
  FaMap,
  FaGithub: FaArrowLeft,
  FaCode: FaArrowLeft,
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

  const FaIcon = FA_ICONS[icon]
  if (FaIcon) {
    return <FaIcon className={className} />
  }

  return null
}
