import {
  BookOpen,
  Code,
  Coins,
  Github,
  Landmark,
  Map,
  Search,
  Users,
  type LucideIcon
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  FaCode: Code,
  FaGithub: Github,
  FaBook: BookOpen,
  FaCoins: Coins,
  FaUsers: Users,
  FaLandmark: Landmark,
  FaMap: Map,
  FaSearch: Search
};

export const getIcon = ({ name, className = 'text-2xl' }: IconProps) => {
  const IconComponent = iconMap[name];
  return IconComponent ? <IconComponent className={className} /> : null;
}; 
