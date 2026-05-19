import Logo from '../ui/Logo'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <Logo size="md" centered subtitle={title} />
        </div>

        {children}

      </div>
    </main>
  )
}
