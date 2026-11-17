import * as React from "react"

import { cn } from "../../lib/utils"

/** Mensagem de retorno de um formulário: erro (`role="alert"`) ou aviso de sucesso (`role="status"`). */
function FormMessage({
  className,
  tone = "error",
  ...props
}: React.ComponentProps<"p"> & { tone?: "error" | "ok" }) {
  return (
    <p
      data-slot="form-message"
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mt-3.5 rounded-[10px] px-3 py-2.5 text-sm",
        tone === "error" ? "bg-destructive/10 text-destructive" : "bg-brand-light text-brand-dark",
        className
      )}
      {...props}
    />
  )
}

export { FormMessage }
