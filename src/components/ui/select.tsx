import * as React from "react"

import { cn } from "@/lib/utils"

export type SelectProps =
  React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-md border-0 bg-transparent px-3 py-1 text-base shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "depth-layer-2 shadow-depth-sm hover:depth-layer-3 hover:shadow-depth-md focus:depth-layer-3 focus:shadow-depth-md transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
