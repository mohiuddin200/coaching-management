import React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";


interface DataLoaderProps {
  /**
   * Size variant of the loader
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

  /**
   * Optional text to display below the spinner
   */
  text?: string;

  /**
   * Whether to center the loader in its container
   * @default true
   */
  centered?: boolean;

  /**
   * Additional className for the container
   */
  className?: string;

  /**
   * Additional className for the spinner
   */
  spinnerClassName?: string;
}

const sizeClasses = {
  sm: "size-4",
  default: "size-6",
  lg: "size-8",
};

const textSizeClasses = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

/**
 * DataLoader - A simple, reusable loading component for displaying loading states
 * 
 * @example
 * // Basic usage
 * <DataLoader />
 * 
 * @example
 * // With text
 * <DataLoader text="Loading data..." />
 * 
 * @example
 * // Small size, not centered
 * <DataLoader size="sm" centered={false} />
 * 
 * @example
 * // Large size with custom text
 * <DataLoader size="lg" text="Please wait..." />
 */
export function DataLoader({
  size = "default",
  text,
  centered = true,
  className,
  spinnerClassName,
}: DataLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        centered && "justify-center min-h-[200px]",
        className
      )}
    >
      <Loader2Icon
        role="status"
        aria-label={text || "Loading"}
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size],
          spinnerClassName
        )}
      />
      {text && (
        <p
          className={cn(
            "text-muted-foreground",
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * InlineLoader - A compact inline loader for use within components
 * 
 * @example
 * <InlineLoader />
 * 
 * @example
 * <InlineLoader text="Loading..." />
 */
export function InlineLoader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2Icon
        role="status"
        aria-label={text || "Loading"}
        className="size-4 animate-spin text-muted-foreground"
      />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * FullPageLoader - A full-page loader that covers the entire viewport
 * 
 * @example
 * <FullPageLoader />
 * 
 * @example
 * <FullPageLoader text="Loading application..." />
 */
export function FullPageLoader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        className
      )}
    >
      <DataLoader size="lg" text={text} centered={false} />
    </div>
  );
}
