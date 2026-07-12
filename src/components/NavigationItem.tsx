import React from "react";

interface NavigationItemProps {
  name: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * NavigationItem Component.
 * Reusable layout menu item button with active state highlights and hover translate micro-animations.
 */
export default function NavigationItem({
  name,
  icon,
  isActive = false,
  onClick,
}: NavigationItemProps) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
      className={`flex items-center gap-3 rounded px-3 py-2 font-sans text-sm font-medium transition duration-150 ease-in-out transform hover:translate-x-1 ${
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <span className="text-base" role="img" aria-label={name}>
        {icon}
      </span>
      <span>{name}</span>
    </a>
  );
}
