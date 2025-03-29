import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <main className="flex-grow pt-20 pb-24 md:pb-16">
        {children}
      </main>
      
      <Footer />
      <MobileNavigation user={user} />
    </div>
  );
}
