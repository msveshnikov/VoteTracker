import { Link } from "wouter";
import { Category } from "@shared/schema";
import { 
  Building, Laptop, Globe, Heart, GraduationCap, DollarSign, Users, Palette, Icon
} from "lucide-react";

interface CategoryCardProps {
  category: Category & { topicCount?: number };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { id, name, icon, topicCount = 0 } = category;
  
  // Map the icon string to a Lucide React component
  const getIconComponent = (iconName?: string): Icon => {
    switch (iconName) {
      case 'buildings': return Building;
      case 'laptop': return Laptop;
      case 'globe': return Globe;
      case 'activity': return Heart;
      case 'graduation-cap': return GraduationCap;
      case 'dollar-sign': return DollarSign;
      case 'users': return Users;
      case 'palette': return Palette;
      default: return Users;
    }
  };
  
  const IconComponent = getIconComponent(icon);
  
  return (
    <Link href={`/category/${id}`}>
      <a className="glass rounded-xl p-6 text-center transition hover:shadow-lg hover:-translate-y-1 group block">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <IconComponent className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</p>
      </a>
    </Link>
  );
}
