import React from "react";
import Link from "next/link";

interface NavigationItemProps {
  name: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * NavigationItem Component.
 * Reusable sidebar route links with active state highlights and hover translate micro-animations.
 */
export default function NavigationItem({
  name,
  icon,
  href,
  isActive = false,
  onClick,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded px-3 py-2 font-sans text-sm font-medium transition duration-150 ease-in-out transform hover:translate-x-1 ${
        isActive
          ? "bg-muted text-foreground font-semibold"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <div className="flex items-center justify-center text-lg w-5 h-5" aria-label={name}>
        {icon}
      </div>
      <span>{name}</span>
    </Link>
  );
}
