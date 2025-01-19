'use client'

import { useCallback, useEffect, useState } from 'react'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { BeatLoader } from 'react-spinners'
import { useSearchParams } from 'next/navigation'
import { newVerification } from '@/actions/new-verification'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()

  const token = searchParams.get('token')

  const onSubmit = useCallback(() => {
    if (success || error) return

    if (!token) {
      setError('Faltando token')
      return
    }
    newVerification(token)
      .then((data) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch(() => {
        setError('Ops, alguma coisa deu errado')
      })
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <CardWrapper
      headerLabel="Confirmando sua verificação"
      backButtonHref="/auth/login"
      backButtonLabel="Voltar ao login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  )
}
