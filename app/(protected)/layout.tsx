import { Navbar } from './_components/navbar'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="h-auto min-h-full w-full flex flex-col items-center justify-start bg-zinc-900 py-6">
      <Navbar />
      {children}
    </div>
  )
}

export default ProtectedLayout
