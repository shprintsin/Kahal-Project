import { IconType } from 'react-icons';
import { 
  FaCode, 
  FaGithub, 
  FaBook, 
  FaCoins, 
  FaUsers, 
  FaLandmark, 
  FaMap,
  FaSearch
} from 'react-icons/fa';

interface IconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, IconType> = {
  FaCode,
  FaGithub,
  FaBook,
  FaCoins,
  FaUsers,
  FaLandmark,
  FaMap,
  FaSearch
};

export const getIcon = ({ name, className = 'text-2xl' }: IconProps) => {
  const IconComponent = iconMap[name];
  return IconComponent ? <IconComponent className={className} /> : null;
}; 
