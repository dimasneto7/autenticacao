import { CardWrapper } from './card-wrapper'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Ops, Algo saiu errado!"
      backButtonHref="/auth/login"
      backButtonLabel="Voltar ao login"
    >
      <div className="w-full flex items-center justify-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  )
}
