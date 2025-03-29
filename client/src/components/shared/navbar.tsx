import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { User as UserType } from "@shared/schema";

interface NavbarProps {
  user: UserType | null;
}

export function Navbar({ user }: NavbarProps) {
  const [, navigate] = useLocation();
  const { logoutMutation } = useAuth();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/">
              <a className="flex items-center">
                <CheckCircle className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  MakeYour<span className="text-primary">.vote</span>
                </span>
              </a>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary transition">Trending</a>
            </Link>
            <Link href="/categories">
              <a className="text-gray-700 hover:text-primary transition">Categories</a>
            </Link>
            <Link href="/create">
              <a className="text-gray-700 hover:text-primary transition">Create Topic</a>
            </Link>
            <Link href="/search">
              <a className="text-gray-700 hover:text-primary transition">Search</a>
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/my-votes")}
                    className="cursor-pointer"
                  >
                    My Votes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="hidden md:block rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-medium transition"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>MakeYour.vote</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Link href="/">
                    <a className="text-lg font-medium">Home</a>
                  </Link>
                  <Link href="/categories">
                    <a className="text-lg font-medium">Categories</a>
                  </Link>
                  <Link href="/create">
                    <a className="text-lg font-medium">Create Topic</a>
                  </Link>
                  <Link href="/search">
                    <a className="text-lg font-medium">Search</a>
                  </Link>
                  {!user && (
                    <Link href="/auth">
                      <a className="text-lg font-medium text-primary">Sign In</a>
                    </Link>
                  )}
                  {user && (
                    <>
                      <div className="h-px bg-gray-200 my-2" />
                      <Link href="/profile">
                        <a className="text-lg font-medium">Profile</a>
                      </Link>
                      <Link href="/my-votes">
                        <a className="text-lg font-medium">My Votes</a>
                      </Link>
                      <button 
                        className="text-lg font-medium text-red-500 text-left" 
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
