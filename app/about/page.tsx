import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import VideoPlayer from '@/components/VideoPlayer'

export const metadata: Metadata = {
  title: 'About Chicken1of1 - UFC Card Breaks & MMA Sports Cards',
  description:
    'Learn about Chicken1of1, your trusted source for UFC card breaks. We break Topps UFC, Panini UFC, and all MMA sports cards live on Whatnot. Meet the team behind Bauk Bauk Baby.',
}

export default function AboutPage() {
  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              About Chicken1of1
            </h1>
            <p className="text-xl text-cage-300">The Story Behind Bauk Bauk Baby</p>
          </div>
        </Container>
      </section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-animate">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-6">
              About Us
            </h2>
            <div className="space-y-4 text-cage-300 leading-relaxed">
              <p>
                Chicken1of1 started in 2021 with streaming UFC card breaks to an audience of 12 people. Since then the Chicken1of1 channel has grown to several sports card loving friends running UFC and entertainment card breaks with one simple goal: have fun while being generous and trustworthy.
              </p>
              <p>
                We stream live on Whatnot, breaking Topps UFC, Panini UFC, and all MMA sports cards along with Wrestling, Disney, Marvel, and other niche categories. Our approach is straightforward - fair breaks, quick and secure shipping, and lots of Bauking.
              </p>
              <p>
                Loitering is welcomed and encouraged in our streams, you do not need to spend to be welcomed or have fun. Every break is recorded live for complete transparency, and we ship quickly with secure packaging.
              </p>
            </div>
          </div>
          <div className="relative scroll-animate">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-dark-800 border border-dark-700/50">
              <VideoPlayer
                src="/gallery/about-hero.mp4"
                poster="/gallery/about-hero-poster.jpg"
                alt="Chicken1of1 breaking cards live - compilation of Instagram reels"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
            Join the Community
          </h2>
          <p className="text-lg text-cage-400 mb-8">
            Follow us across platforms for break schedules, hit showcases, and
            hobby education. Bauk Bauk Baby!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/s/muoENH2W'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Watch on Whatnot
            </a>
            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
