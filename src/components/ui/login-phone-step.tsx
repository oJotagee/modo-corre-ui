"use client"

import * as React from "react"

import { normalizePhone } from "../../lib/phone"
import { Field, FieldLabel } from "./field"
import { FormMessage } from "./form-message"
import { LoginButton } from "./login-button"
import { PhoneInput } from "./phone-input"

type LoginPhoneStepProps = {
  /** Celular já digitado (ex.: ao voltar do passo do código). */
  defaultPhone?: string
  /**
   * Pede o código para o celular informado (com máscara). Se a promessa for rejeitada, a mensagem do erro aparece
   * abaixo do botão.
   */
  onSubmit: (phone: string) => Promise<unknown>
  /** Converte o erro em texto; devolva `null` para não mostrar mensagem. Padrão: `error.message`. */
  formatError?: (error: unknown) => string | null
  /** Conteúdo extra abaixo da mensagem de erro (ex.: código de referência do erro). */
  renderErrorFooter?: (error: unknown) => React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  label?: React.ReactNode
  submitLabel?: React.ReactNode
}

function defaultFormatError(error: unknown): string | null {
  return error instanceof Error ? error.message : "Não foi possível continuar. Tente novamente."
}

/**
 * Primeiro passo do login: celular com DDD e botão para receber o código. Cuida da máscara, da validação e do estado
 * de envio; a chamada à api fica com o app, via `onSubmit`.
 */
function LoginPhoneStep({
  defaultPhone = "",
  onSubmit,
  formatError = defaultFormatError,
  renderErrorFooter,
  title = "Acesse sua conta",
  description = "Entre com o celular cadastrado para receber o código pelo WhatsApp.",
  label = "Celular cadastrado com DDD",
  submitLabel = "Receber código",
}: LoginPhoneStepProps) {
  const [phone, setPhone] = React.useState(defaultPhone)

  const [pending, setPending] = React.useState(false)

  const [error, setError] = React.useState<unknown>(null)

  const message = error !== null ? formatError(error) : null

  const isValid = normalizePhone(phone) !== null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!isValid || pending) return

    setPending(true)
    setError(null)

    try {
      await onSubmit(phone)
    } catch (caught) {
      setError(caught)
    } finally {
      setPending(false)
    }
  }

  return (
    <form data-slot="login-phone-step" onSubmit={handleSubmit} noValidate>
      <h1 className="text-[26px] font-extrabold">{title}</h1>
      <p className="mt-1.5 mb-6 text-ink-2">{description}</p>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="phone" className="text-[13px] font-semibold text-ink-2">
          {label}
        </FieldLabel>
        <PhoneInput
          id="phone"
          autoFocus
          value={phone}
          onChange={(value) => {
            setPhone(value)
            setError(null)
          }}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "phone-message" : undefined}
        />
      </Field>

      <LoginButton type="submit" disabled={!isValid} isLoading={pending} loadingLabel="Enviando…">
        {submitLabel}
      </LoginButton>

      {message ? (
        <div id="phone-message">
          <FormMessage>{message}</FormMessage>
          {renderErrorFooter?.(error)}
        </div>
      ) : null}
    </form>
  )
}

export { LoginPhoneStep }
export type { LoginPhoneStepProps }
