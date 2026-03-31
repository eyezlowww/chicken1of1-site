// NextAuth v5 type augmentation to include role in session and JWT

import 'next-auth'
import '@auth/core/jwt'

declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      role: string
      name: string
      email: string
      image?: string
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
