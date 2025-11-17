"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        {...props}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Sanitize CSS to prevent XSS
function sanitizeCSS(css: string): string {
  // Remove any potentially dangerous CSS
  return css
    .replace(/<script/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/@import/gi, '')
    .replace(/url\(javascript:/gi, '')
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  // Generate CSS safely
  const cssContent = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const colors = colorConfig
        .map(([key, itemConfig]) => {
          const color =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
            itemConfig.color
          // Validate color is a valid CSS color value
          if (color && /^[#a-zA-Z0-9(),.\s-]+$/.test(color)) {
            return `--color-${key}: ${color};`
          }
          return null
        })
        .filter(Boolean)
        .join(" ")
      return colors
        ? `${prefix === "" ? ":root" : prefix} { ${colors} }`
        : null
    })
    .filter(Boolean)
    .join("\n")

  // Sanitize the CSS before injecting
  const sanitizedCSS = sanitizeCSS(cssContent)

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: sanitizedCSS,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  nameKey,
  payload, // Destructure payload here
}: {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
} & React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  const { config } = useChart()

  if (config === undefined) {
    return null
  }

  return (
    <div className="grid min-w-[120px] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="grid gap-1">
        {payload?.map((entry: any, entryIndex: number) => { // Use destructured payload
          const key = `${nameKey || entry.dataKey || entryIndex}`
          const itemConfig = config[key]
          if (!itemConfig) {
            return null
          }

          return (
            <div
              key={`tooltip-${entryIndex}`}
              className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
            >
              {itemConfig.icon ? (
                <itemConfig.icon />
              ) : !hideIndicator ? (
                <div
                  className={`h-2 w-2 shrink-0 rounded-[2px] ${
                    indicator === "dot" ? "h-2 w-2" : "h-1 w-4"
                  }`}
                  style={{
                    backgroundColor: entry.color,
                  }}
                />
              ) : null}
              <div className="flex w-full flex-1 justify-between leading-none">
                <span className="capitalize text-foreground/70">
                  {itemConfig.label || entry.dataKey}
                </span>
                <span className="font-medium text-foreground ml-2">
                  {entry.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  hideIcon = false,
  nameKey,
  payload, // Destructure payload here
}: {
  hideIcon?: boolean
  nameKey?: string
} & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    payload?: Array<{
      id: string
      value: string
      color: string
      inactive?: boolean
    }>
  }) {
  const { config } = useChart()

  if (config === undefined) {
    return null
  }

  const legendPayload = payload || []

  return (
    <div className="flex items-center justify-center gap-4">
      {legendPayload.map((entry, index) => {
        const key = `${nameKey || entry.id}`
        const itemConfig = config[key]

        return (
          <div
            key={`legend-${index}-${entry.value}`}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              entry.inactive ? "opacity-50" : "opacity-100"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: entry.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
}