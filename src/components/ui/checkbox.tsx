import * as React from "react";
import { Check } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "depth-layer-2 shadow-inset data-[state=checked]:depth-top data-[state=checked]:shadow-depth-md transition-all duration-200",
          "appearance-none bg-background checked:bg-primary cursor-pointer",
          className
        )}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      {checked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
