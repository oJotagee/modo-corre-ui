"use client"

import * as React from "react"

import { formatPhoneInput } from "../../lib/phone"
import { cn } from "../../lib/utils"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group"

type PhoneInputProps = Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string
  /** Recebe o texto já com a máscara `(00) 00000-0000`. */
  onChange: (value: string) => void
  /** Mostra o prefixo +55 antes do campo. */
  showCountryCode?: boolean
}

/** Campo de celular brasileiro com DDD, máscara automática e teclado numérico. */
function PhoneInput({
  value,
  onChange,
  showCountryCode = true,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: PhoneInputProps) {
  return (
    <InputGroup
      data-slot="phone-input"
      className="h-[52px] rounded-xl border-[1.5px] border-input bg-card shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-4 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/25"
    >
      {showCountryCode ? (
        <InputGroupAddon className="pl-3.5">
          <InputGroupText className="font-semibold text-mute">+55</InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(00) 00000-0000"
        maxLength={15}
        aria-invalid={ariaInvalid}
        className={cn(
          "font-heading text-lg font-semibold tracking-[0.03em] text-ink placeholder:text-mute/70 md:text-lg",
          className
        )}
        value={value}
        onChange={(event) => onChange(formatPhoneInput(event.target.value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")))}
        {...props}
      />
    </InputGroup>
  )
}

export { PhoneInput }
export type { PhoneInputProps }
