import { UserCircle, CalendarCheck, LayoutTemplate, Users } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    title: 'Create your account',
    description:
      'Sign up in 30 seconds. No technical skills needed — just your name and email to get started.',
  },
  {
    number: '02',
    icon: LayoutTemplate,
    title: 'Set up your profile',
    description:
      'Add your photo, specialties, fees, and availability. Your professional booking page is ready instantly.',
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'Share your booking link',
    description:
      'Send your unique link to clients via WhatsApp, Instagram, or email. They book a slot in under a minute.',
  },
  {
    number: '04',
    icon: Users,
    title: 'Manage your practice',
    description:
      'Track appointments, write session notes, and manage all your clients from one simple dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-stone-50">
      <div className="max-w-5xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          {/* <span className="text-[#5a7f7a] text-sm font-medium tracking-wide uppercase">
            How it works
          </span> */}
          <h2
            className="text-4xl text-black font-semibold "
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
                How it Works         
 </h2>


          {/* <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            No technical knowledge required. Most therapists are fully set up
            within 10 minutes.
          </p> */}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 flex gap-5"
              >
                {/* Number + Icon */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#d4e4e1] flex items-center justify-center">
                    <Icon className="text-[#5a7f7a]" size={22} />
                  </div>
                </div>

                {/* Text */}
                <div>
                  <span className="text-xs font-semibold text-[#5a7f7a] tracking-widest">
                    STEP {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Connector line — desktop only */}
        {/* <div className="hidden md:flex items-center justify-center mt-10 gap-2">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#a3b8b4] text-white text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-16 h-px bg-[#b8ceca]" />
              )}
            </div>
          ))}
        </div> */}

      </div>
    </section>
  )
}