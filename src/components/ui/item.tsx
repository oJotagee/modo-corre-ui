import { cn } from "../../lib/utils";

function Item({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "outline" | "muted";
}) {
  return (
    <div
      data-slot="item"
      data-variant={variant}
      className={cn(
        "flex items-center gap-3 rounded-lg p-3 text-sm",
        variant === "outline" && "border bg-card",
        variant === "muted" && "bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn("font-medium leading-none", className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ml-auto flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemTitle };
