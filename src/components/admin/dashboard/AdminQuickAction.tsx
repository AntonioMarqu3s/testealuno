
import React from "react";

interface AdminQuickActionProps {
  label: string;
  description: string;
  href: string;
}

export function AdminQuickAction({ label, description, href }: AdminQuickActionProps) {
  return (
    <a 
      href={href} 
      className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
    >
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </a>
  );
}
