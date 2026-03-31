// Root /streamdata route - redirects to dashboard if authenticated, login if not

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function StreamDataPage() {
  const session = await auth()

  if (session?.user) {
    if ((session.user as any).role === 'admin') {
      redirect('/streamdata/admin')
    }
    redirect('/streamdata/dashboard')
  } else {
    redirect('/streamdata/login')
  }
}
