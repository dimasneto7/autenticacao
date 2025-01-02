import { Roboto } from 'next/font/google'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { LoginButton } from '@/components/auth/login-button'

const font = Roboto({
  subsets: ['latin'],
  weight: ['700'],
})

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-zinc-900">
      <div className="space-y-4 text-center">
        <h1
          className={cn(
            'text-6xl font-semibold text-white drop-shadow-md',
            font.className
          )}
        >
          Autenticação
        </h1>
        <p className="text-white text-lg">
          Sistema de Autenticação de Usuários
        </p>
        <div>
          <LoginButton>
            <Button size="lg" variant="secondary">
              Entrar
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  )
}
