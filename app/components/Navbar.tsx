"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { checkAndAddUser } from "../actions";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, isSignedIn, user?.primaryEmailAddress?.emailAddress]);

  const navLinks = [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/budjets", label: "Budgets" },
    { href: "/transactions", label: "Transactions" },
    { href: "/revenus", label: "Revenus" },
    { href: "/epargne", label: "Épargne" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="glass sticky top-0 z-50 px-5 md:px-[10%] py-3">
      {isLoaded &&
        (isSignedIn ? (
          <>
            <div className="flex justify-between items-center">
              <Link href="/dashboard" className="flex text-2xl items-center font-bold">
                Cha9a9ty<span className="text-gradient">.tn</span>
              </Link>

              <div className="md:flex hidden items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`btn btn-sm btn-ghost rounded-lg ${
                      isActive(link.href)
                        ? "bg-accent/20 text-accent font-semibold"
                        : "hover:bg-base-300/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <UserButton />
                <button
                  className="md:hidden btn btn-sm btn-ghost"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-3 pb-2 flex flex-col gap-1 animate-fade-in">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`btn btn-sm btn-ghost justify-start rounded-lg ${
                      isActive(link.href)
                        ? "bg-accent/20 text-accent"
                        : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <Link href="/" className="flex text-2xl items-center font-bold">
              Cha9a9ty<span className="text-gradient">.tn</span>
            </Link>
            <div className="flex gap-2">
              <Link href="/sign-in" className="btn btn-sm btn-ghost">
                Se connecter
              </Link>
              <Link href="/sign-up" className="btn btn-sm btn-accent rounded-lg">
                S&apos;inscrire
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Navbar;