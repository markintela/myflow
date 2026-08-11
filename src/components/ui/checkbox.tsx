import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0",
        checked ? "bg-brand-green border-brand-green" : "border-slate-300 bg-white",
        className
      )}
    >
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </button>
  );
}
