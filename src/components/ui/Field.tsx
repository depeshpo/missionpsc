import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Label + control wrapper for forms. Pass the control as children; wire `htmlFor`
 * to the control's `id`. Optional `hint` (muted helper text) or `error` (shown in
 * place of the hint).
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-warning">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-warning">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
