import Logo from '../ui/Logo'
import Link from 'next/link'

export interface FooterTenant {
  brandName: string
  footerTagline?: string
}

const DEFAULT_TENANT: FooterTenant = {
  brandName: 'Counsellors of India',
  footerTagline: 'Practice management built for Indian therapists and counsellors.',
}

export default function Footer({ tenant = DEFAULT_TENANT }: { tenant?: FooterTenant } = {}) {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <Logo size="sm" brandName={tenant.brandName} />
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            {tenant.footerTagline ?? DEFAULT_TENANT.footerTagline}
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
        © {new Date().getFullYear()} {tenant.brandName}. All rights reserved.
      </div>
    </footer>
  )
}