"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "../../lib/utils"

function RadioGroup<Value>({ className, ...props }: RadioGroupPrimitive.Props<Value>) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn("flex gap-3", className)} {...props} />
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "inline-flex h-11 min-w-24 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
