"use client"

import * as React from "react"

import { Button } from "./button"
import { FormMessage } from "./form-message"
import { LoginButton } from "./login-button"
import { isOtpComplete, OtpInput } from "./otp-input"

type LoginCodeStepProps = {
  /** Celular para o qual o código foi enviado, como será mostrado ao usuário. */
  phone: string
  /** Quando o reenvio é liberado (data ISO). */
  resendAvailableAt: string
  /** Confere o código. Se a promessa for rejeitada, o código é limpo e a mensagem do erro aparece. */
  onVerify: (code: string) => Promise<unknown>
  /** Pede um novo código e devolve quando o próximo reenvio é liberado. */
  onResend: () => Promise<{ resendAvailableAt: string }>
  /** Volta ao passo do celular. */
  onBack: () => void
  codeLength?: number
  /** Converte o erro em texto; devolva `null` para não mostrar mensagem. Padrão: `error.message`. */
  formatError?: (error: unknown) => string | null
  /** Conteúdo extra abaixo da mensagem de erro (ex.: código de referência do erro). */
  renderErrorFooter?: (error: unknown) => React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  hint?: React.ReactNode
  resendNotice?: React.ReactNode
}

function defaultFormatError(error: unknown): string | null {
  return error instanceof Error ? error.message : "Não foi possível continuar. Tente novamente."
}

function secondsUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000))
}

const LINK_BUTTON_CLASS =
  "h-auto p-0 font-semibold text-ink-2 underline underline-offset-[3px] disabled:text-mute disabled:no-underline disabled:opacity-100"

/**
 * Segundo passo do login: código de uso único, envio automático ao completar, contagem para reenviar e volta ao
 * celular. As chamadas à api ficam com o app, via `onVerify` e `onResend`.
 */
function LoginCodeStep({
  phone,
  resendAvailableAt,
  onVerify,
  onResend,
  onBack,
  codeLength = 6,
  formatError = defaultFormatError,
  renderErrorFooter,
  title = "Confirme seu acesso",
  description,
  hint = "O código vale por 5 minutos. Não recebeu? Confira se o número está certo ou peça um novo código.",
  resendNotice = "Enviamos um novo código. Use sempre o último que chegou.",
}: LoginCodeStepProps) {
  const [code, setCode] = React.useState("")

  const [available, setAvailable] = React.useState(resendAvailableAt)

  const [secondsLeft, setSecondsLeft] = React.useState(() => secondsUntil(resendAvailableAt))

  const [verifying, setVerifying] = React.useState(false)

  const [verified, setVerified] = React.useState(false)

  const [resending, setResending] = React.useState(false)

  const [error, setError] = React.useState<unknown>(null)

  const [notice, setNotice] = React.useState<React.ReactNode>(null)

  const busy = verifying || verified

  const complete = isOtpComplete(code, codeLength)

  const message = error !== null ? formatError(error) : null

  React.useEffect(() => {
    const update = () => setSecondsLeft(secondsUntil(available))

    update()

    const timer = setInterval(update, 1000)

    return () => clearInterval(timer)
  }, [available])

  const verify = React.useCallback(
    async (value: string) => {
      setNotice(null)
      setError(null)
      setVerifying(true)

      try {
        await onVerify(value)
        setVerified(true)
      } catch (caught) {
        setError(caught)
        setCode("")
      } finally {
        setVerifying(false)
      }
    },
    [onVerify]
  )

  React.useEffect(() => {
    if (complete && !busy) void verify(code)
  }, [code])

  async function handleResend() {
    setResending(true)
    setError(null)

    try {
      const result = await onResend()

      setCode("")
      setNotice(resendNotice)
      setAvailable(result.resendAvailableAt)
    } catch (caught) {
      setError(caught)
    } finally {
      setResending(false)
    }
  }

  return (
    <form
      data-slot="login-code-step"
      onSubmit={(event) => {
        event.preventDefault()

        if (complete && !busy) void verify(code)
      }}
      noValidate
    >
      <h1 className="text-[26px] font-extrabold">{title}</h1>
      <p className="mt-1.5 mb-6 text-ink-2">
        {description ?? (
          <>
            Enviamos um código de {codeLength} dígitos para o WhatsApp{" "}
            <b className="whitespace-nowrap text-ink">{phone}</b>.
          </>
        )}
      </p>

      <OtpInput
        length={codeLength}
        value={code}
        onChange={(value) => {
          setError(null)
          setCode(value)
        }}
        disabled={busy}
        invalid={error !== null}
      />

      <LoginButton type="submit" disabled={!complete || busy} isLoading={busy} loadingLabel="Entrando…">
        Entrar
      </LoginButton>

      {message ? (
        <>
          <FormMessage>{message}</FormMessage>
          {renderErrorFooter?.(error)}
        </>
      ) : notice ? (
        <FormMessage tone="ok">{notice}</FormMessage>
      ) : null}

      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-2.5 text-sm">
        <Button type="button" variant="link" className={LINK_BUTTON_CLASS} onClick={onBack} disabled={busy}>
          ← Trocar número
        </Button>
        <Button
          type="button"
          variant="link"
          className={LINK_BUTTON_CLASS}
          onClick={() => void handleResend()}
          disabled={secondsLeft > 0 || resending || busy}
          aria-live="polite"
        >
          {resending ? "Reenviando…" : secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : "Reenviar código"}
        </Button>
      </div>

      <div className="mt-6 flex gap-2.5 border-t border-line pt-[18px] text-[13px] text-mute">
        <span
          aria-hidden
          className="grid size-[22px] flex-none place-items-center rounded-full bg-whatsapp text-xs text-white"
        >
          ←
        </span>
        <span>{hint}</span>
      </div>
    </form>
  )
}

export { LoginCodeStep }
export type { LoginCodeStepProps }
