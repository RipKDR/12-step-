import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

const badgeVariants = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

export function Badge({ children, variant = "secondary", className }: BadgeProps) {
  return (
    <span className={cn("badge", badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
