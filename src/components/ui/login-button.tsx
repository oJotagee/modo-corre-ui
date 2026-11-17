"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

/** Botão principal das telas de login: largura total, alto e com indicador de carregamento. */
function LoginButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="login-button"
      size="lg"
      className={cn(
        "mt-5 h-[50px] w-full rounded-xl text-base font-bold hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 [&_svg:not([class*='size-'])]:size-[18px]",
        className
      )}
      {...props}
    />
  )
}

export { LoginButton }
