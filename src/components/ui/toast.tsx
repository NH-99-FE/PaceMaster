import * as React from "react"

import { cn } from "@/lib/utils"

const ToastProvider = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-0 z-50 flex w-full flex-col-reverse items-center gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastProvider.displayName = "ToastProvider"

const ToastViewport = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:items-end",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

const Toast = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn(
      "pointer-events-auto relative flex w-full items-start justify-between gap-3 rounded-lg border bg-background p-4 text-sm shadow-lg",
      variant === "destructive" && "border-destructive/50 text-destructive",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  React.ElementRef<"h4">,
  React.ComponentPropsWithoutRef<"h4">
>(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription }
