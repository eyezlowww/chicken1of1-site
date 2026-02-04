import Container from './Container'

const props = [
  {
    icon: (
      <svg className="w-8 h-8 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'UFC Specialist',
    description: 'The only dedicated UFC & combat sports card breaking channel. We know this niche inside and out.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Live Transparency',
    description: 'Every break is streamed live. No cuts, no editing. What you see is what you get.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2v-1M15 10V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    title: 'Community First',
    description: 'Started in 2021 with 12 viewers. Loitering welcomed. You do not need to spend to be part of the Coop.',
  },
]

export default function ValueProps() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0a0a0a]">
      {/* Subtle red glow between hero and content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blood-700/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 cage-pattern opacity-30" />
      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {props.map((prop) => (
            <div key={prop.title} className="text-center scroll-animate">
              <div className="w-20 h-20 bg-dark-800/80 border border-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/5">
                {prop.icon}
              </div>
              <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide mb-2">
                {prop.title}
              </h3>
              <p className="text-cage-400 leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
