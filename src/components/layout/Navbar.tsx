import Link from 'next/link'
import Logo from '../ui/Logo'
import Button from '../ui/Button'

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/features" className="hover:text-teal-600 transition">Features</Link>
          <Link href="/pricing" className="hover:text-teal-600 transition">Pricing</Link>
          <Link href="/about" className="hover:text-teal-600 transition">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button  variant="outline" className='bg-[#354744] border rounded-full text-white hover:text-[#7d9e99] hover:border-[#7d9e99] hover:border-1 hover:rounded-full ' size="sm">Sign in</Button>
          </Link>
          {/* <Link href="/signup">
            <Button variant="outline" className='bg-[#354744] text-white hover:bg-[#ffffff] hover:text-[#7d9e99]' size="sm">Get Started</Button>
          </Link> */}
        </div>
      </div>
    </header>
  )
}