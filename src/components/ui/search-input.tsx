import * as React from "react"
import { Search } from "@/lib/icons"

import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative",
          "depth-layer-2 rounded-lg shadow-depth-sm hover:shadow-depth-md focus-within:depth-layer-3 focus-within:shadow-depth-md transition-all duration-200"
        )}
      >
        {icon || <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
        <Input
          ref={ref}
          className={cn(
            "pl-10 border-0 bg-transparent shadow-none focus:shadow-none",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
