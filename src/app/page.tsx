import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import HowItWorks from '@/components/landing/HowItWorks'
import TemplateShowcase from '@/components/landing/TemplateShowcase'
import PricingPage from './pricing/page'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-stone-50">

        {/* Hero */}
        {/* <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 leading-tight"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Your practice,<br /> beautifully managed.
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">
            Counsellors of India helps therapists manage appointments, clients, 
            and notes all in one calm, focused workspace.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start for Free</Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">See How It Works</Button>
            </Link>
          </div>
        </section> */}

        <section className="relative h-screen w-full">

  {/* Background Image */}
  <img
    src="/image.png"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/60" />

  {/* Content */}
  <div className="relative z-10 h-full flex items-end">
    <div className="max-w-6xl mx-auto px-6 pb-20 w-full">

      <div className="max-w-xl text-white">

        <h1
          className="text-5xl sm:text-6xl leading-tight mb-6"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Introducing Counsellors of India,
          a mental health collective.
        </h1>

        <p className="text-gray-200 text-lg mb-8">
          Manage your therapy practice, connect with clients, and grow your impact, all in one calm workspace.
        </p>

        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className=" text-white">
              Get Started
            </Button>
          </Link>

          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="border-white hover:text-[#5a7f7a] text-white">
              Learn More
            </Button>
          </Link>
        </div>

      </div>

    </div>
  </div>

</section>

       <HowItWorks />
       <PricingPage />
      <TemplateShowcase />

      </main>
      <Footer />
    </>
  )
}