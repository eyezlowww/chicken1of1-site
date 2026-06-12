import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollAnimateProvider from '@/components/ScrollAnimateProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:font-bold focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>
      <ScrollAnimateProvider />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}
