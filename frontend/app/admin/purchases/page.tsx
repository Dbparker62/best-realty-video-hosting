"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdminPurchases } from "@/lib/admin-api"
import { DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-react"

export default function AdminPurchasesPage() {
  const { data: purchases, isLoading } = useSWR(
    "admin-purchases",
    getAdminPurchases
  )

  const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount, 0) || 0
  const uniqueCustomers = new Set(purchases?.map((p) => p.userId)).size
  const averageOrderValue = purchases?.length
    ? totalRevenue / purchases.length
    : 0

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Total Purchases",
      value: purchases?.length || 0,
      icon: ShoppingCart,
    },
    {
      title: "Unique Customers",
      value: uniqueCustomers,
      icon: Users,
    },
    {
      title: "Average Order",
      value: `$${averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
        <p className="text-muted-foreground">
          View all course purchases and revenue
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            All course purchases sorted by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : purchases?.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">No purchases yet</p>
              <p className="text-sm text-muted-foreground">
                Purchases will appear here once customers start buying courses
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases
                  ?.sort(
                    (a, b) =>
                      new Date(b.purchasedAt).getTime() -
                      new Date(a.purchasedAt).getTime()
                  )
                  .map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {new Date(purchase.purchasedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.purchasedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{purchase.userEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {purchase.userId}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{purchase.courseTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {purchase.courseId}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-accent">
                          ${purchase.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
