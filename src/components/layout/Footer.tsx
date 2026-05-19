import Logo from '../ui/Logo'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <Logo size="sm" />
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            Practice management built for Indian therapists and counsellors.
          </p>
        </div>
        <div className="flex gap-10 text-sm text-gray-500">
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Product</p>
            <Link href="#" className="block hover:text-[#5a7f7a]">Features</Link>
            <Link href="#" className="block hover:text-[#5a7f7a]">Pricing</Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Legal</p>
            <Link href="#" className="block hover:text-[#5a7f7a]">Privacy</Link>
            <Link href="#" className="block hover:text-[#5a7f7a]">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Counsellors of India. All rights reserved.
      </div>
    </footer>
  )
}