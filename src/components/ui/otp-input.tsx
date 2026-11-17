"use client"

import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { cn } from "../../lib/utils"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp"

type OtpInputProps = {
  /** Quantidade de dígitos do código. */
  length: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Marca o código como inválido: borda de erro e animação curta de tremor. */
  invalid?: boolean
  autoFocus?: boolean
  "aria-label"?: string
  className?: string
}

/**
 * Campo de código de uso único (OTP) numérico com a identidade Modo Corre: células que dividem a largura, teclado
 * numérico no celular e preenchimento automático do código recebido por SMS.
 */
function OtpInput({
  length,
  value,
  onChange,
  disabled,
  invalid,
  autoFocus = true,
  "aria-label": ariaLabel = "Código de acesso",
  className,
}: OtpInputProps) {
  const slots = React.useMemo(() => Array.from({ length }, (_, index) => index), [length])

  return (
    <InputOTP
      data-slot="otp-input"
      maxLength={length}
      value={value}
      onChange={onChange}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-invalid={invalid}
      containerClassName={cn("w-full", className)}
    >
      <InputOTPGroup className="w-full justify-between gap-1.5 sm:gap-2">
        {slots.map((index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-invalid={invalid}
            className={cn(
              "aspect-[1/1.15] h-auto w-full max-w-[54px] min-w-0 rounded-xl border-[1.5px] border-input bg-card font-heading text-2xl font-bold text-foreground shadow-none first:rounded-xl first:border-l-[1.5px] last:rounded-xl data-[active=true]:border-ring data-[active=true]:ring-4 data-[active=true]:ring-ring/25",
              invalid && "animate-otp-shake border-destructive"
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

/** Indica se o texto já tem exatamente `length` dígitos. */
function isOtpComplete(value: string, length: number): boolean {
  return /^\d+$/.test(value) && value.length === length
}

export { OtpInput, isOtpComplete }
export type { OtpInputProps }
