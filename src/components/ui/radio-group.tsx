import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, disabled, children, ...props }, ref) => {
    const uniqueName = React.useId();

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-2",
          "depth-layer-2 rounded-lg p-4 shadow-depth-md space-y-2",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<RadioGroupItemProps>(child) && child.type === RadioGroupItem) {
            const childProps = child.props as RadioGroupItemProps;
            return React.cloneElement(child, {
              name: name || uniqueName,
              checked: childProps.value === value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                onValueChange?.(e.target.value);
                childProps.onChange?.(e);
              },
              disabled: disabled || childProps.disabled,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, children, value, checked, onChange, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        type="radio"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "depth-layer-3 shadow-depth-sm hover-lift cursor-pointer transition-all duration-200 appearance-none",
          "bg-background checked:bg-transparent",
          className
        )}
        checked={checked}
        onChange={onChange}
        value={value}
        {...props}
      />
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
          checked ? "bg-primary scale-100" : "bg-transparent scale-0",
          "transition-transform duration-200"
        )}
      />
      {children && (
        <label
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            "text-shadow-sm ml-2 cursor-pointer"
          )}
        >
          {children}
        </label>
      )}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
