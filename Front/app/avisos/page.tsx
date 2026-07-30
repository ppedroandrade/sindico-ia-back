"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminAnnouncements } from "@/components/admin-announcements"
import { ResidentAnnouncements } from "@/components/resident-announcements"
import { useCurrentUser } from "@/components/auth-context"

export default function AnnouncementsPage() {
  const currentUser = useCurrentUser()

  return <DashboardLayout>{currentUser?.role === "admin" ? <AdminAnnouncements /> : <ResidentAnnouncements />}</DashboardLayout>
}
