import { MainLayout } from '@/components/MainLayout'
import { AuthGuard } from '@/domains/auth/guards/AuthGuard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: AuthGuard,
  component: () => <MainLayout><Outlet /></MainLayout>
}) 