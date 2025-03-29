import { Link, useLocation } from "wouter";
import { Home, Tag, Plus, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { User as UserType } from "@shared/schema";

interface MobileNavigationProps {
  user: UserType | null;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-dark shadow-lg">
      <div className="flex items-center justify-around py-3">
        <Link href="/">
          <a className="flex flex-col items-center">
            <Home className={cn(
              "h-6 w-6",
              location === "/" ? "text-white" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs mt-1",
              location === "/" ? "text-white" : "text-gray-400"
            )}>Home</span>
          </a>
        </Link>
        
        <Link href="/categories">
          <a className="flex flex-col items-center">
            <Tag className={cn(
              "h-6 w-6",
              location.startsWith("/categor") ? "text-white" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs mt-1",
              location.startsWith("/categor") ? "text-white" : "text-gray-400"
            )}>Categories</span>
          </a>
        </Link>
        
        <Link href="/create">
          <a className="flex flex-col items-center">
            <div className="bg-primary rounded-full p-3 -mt-8 shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-400">Create</span>
          </a>
        </Link>
        
        <Link href="/search">
          <a className="flex flex-col items-center">
            <Search className={cn(
              "h-6 w-6",
              location === "/search" ? "text-white" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs mt-1",
              location === "/search" ? "text-white" : "text-gray-400"
            )}>Search</span>
          </a>
        </Link>
        
        <Link href={user ? "/profile" : "/auth"}>
          <a className="flex flex-col items-center">
            <User className={cn(
              "h-6 w-6",
              (location === "/auth" || location === "/profile") ? "text-white" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs mt-1",
              (location === "/auth" || location === "/profile") ? "text-white" : "text-gray-400"
            )}>{user ? "Profile" : "Sign In"}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
