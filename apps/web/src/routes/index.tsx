import { AuthGuard } from '@/domains/auth/guards/AuthGuard'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({  
  beforeLoad: AuthGuard,
  loader: () => {
    throw redirect({
      to: '/Tasks'
    })
  }
})
