import { UserCircle, CalendarCheck, LayoutTemplate, Users } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    title: 'Create your therapist account',
    description:
      'Sign up in 30 seconds. No technical skills needed — just your name and email to get started.',
  },
  {
    number: '02',
    icon: LayoutTemplate,
    title: 'Build your counsellor profile',
    description:
      'Add your photo, specialties, fees, and availability. Your professional booking page is ready instantly.',
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'Share your booking link with clients',
    description:
      'Send your unique link to clients via WhatsApp, Instagram, or email. They book a slot in under a minute.',
  },
  {
    number: '04',
    icon: Users,
    title: 'Manage appointments & session notes',
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
          <h2
            className="text-4xl text-black font-semibold"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Get your counselling practice <em>online in under 10 minutes</em>
          </h2>
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

      </div>
    </section>
  )
}
