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
      <ScrollAnimateProvider />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
