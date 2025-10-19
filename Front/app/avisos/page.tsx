"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminAnnouncements } from "@/components/admin-announcements"
import { ResidentAnnouncements } from "@/components/resident-announcements"
import { useEffect, useState } from "react"

export default function AnnouncementsPage() {
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  return <DashboardLayout>{userRole === "admin" ? <AdminAnnouncements /> : <ResidentAnnouncements />}</DashboardLayout>
}
