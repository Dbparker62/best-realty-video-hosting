"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Users, DollarSign, Video } from "lucide-react"
import { getAdminCourses, getAdminPurchases } from "@/lib/admin-api"

export default function AdminDashboardPage() {
  const { data: courses, isLoading: coursesLoading } = useSWR(
    "admin-courses",
    getAdminCourses
  )
  const { data: purchases, isLoading: purchasesLoading } = useSWR(
    "admin-purchases",
    getAdminPurchases
  )

  const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount, 0) || 0
  const publishedCourses = courses?.filter((c) => c.published).length || 0
  const totalLessons = courses?.reduce((sum, c) => sum + (c.lessonCount || 0), 0) || 0
  const uniqueCustomers = new Set(purchases?.map((p) => p.userId)).size

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "From all purchases",
      icon: DollarSign,
    },
    {
      title: "Published Courses",
      value: publishedCourses,
      description: `${courses?.length || 0} total courses`,
      icon: BookOpen,
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      description: "Across all courses",
      icon: Video,
    },
    {
      title: "Customers",
      value: uniqueCustomers,
      description: `${purchases?.length || 0} total purchases`,
      icon: Users,
    },
  ]

  const isLoading = coursesLoading || purchasesLoading

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your course platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Latest course sales</CardDescription>
          </CardHeader>
          <CardContent>
            {purchasesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {purchases?.slice(0, 5).map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{purchase.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.userEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${purchase.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
            <CardDescription>Overview of your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {courses?.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.lessonCount || 0} lessons
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        course.published
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {course.published ? "Published" : "Draft"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
