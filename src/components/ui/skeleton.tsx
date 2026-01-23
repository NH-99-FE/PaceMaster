import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

// 骨架屏：保持布局稳定，避免加载时跳动。
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
