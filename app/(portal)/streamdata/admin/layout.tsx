// Admin layout guard — redirects non-admin users to the streamer dashboard
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/streamdata/dashboard')
  }
  return <>{children}</>
}
