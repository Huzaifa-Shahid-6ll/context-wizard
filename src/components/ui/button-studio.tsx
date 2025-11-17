/**
 * Enhanced Button component with shadcn/studio styling
 * Preserves all existing custom styles (depth layers, shadows, hover effects)
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Preserve all existing custom styles
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive will-change-transform",
  {
    variants: {
      variant: {
        default: "depth-top shadow-depth-lg text-shadow-sm hover:shadow-elevated hover:scale-105 active:scale-95 active:shadow-depth-md disabled:shadow-none bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "depth-top shadow-depth-lg hover:shadow-elevated hover:scale-105 active:scale-95 bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "depth-layer-2 shadow-depth-sm border-0 hover:depth-layer-3 hover:shadow-depth-md bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "depth-layer-3 shadow-depth-md hover:depth-top hover:shadow-depth-lg hover:scale-102 active:scale-98 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:depth-layer-2 hover:shadow-depth-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

