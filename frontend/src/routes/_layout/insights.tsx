import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

import { type ItemStatus, ItemsService } from "@/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STATUSES: { status: ItemStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
]

export const Route = createFileRoute("/_layout/insights")({
  component: Insights,
  head: () => ({
    meta: [
      {
        title: "Insights - FastAPI Template",
      },
    ],
  }),
})

function StatusCards() {
  const { data } = useSuspenseQuery({
    queryFn: async () => (await ItemsService.readItemsStats()).data,
    queryKey: ["items", "stats"],
  })
  const totals = new Map(data.data.map((row) => [row.status, row.total]))

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STATUSES.map(({ status, label }) => (
        <Card key={status}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {totals.get(status) ?? 0}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Insights() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Your items by status</p>
      </div>
      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <StatusCards />
      </Suspense>
    </div>
  )
}
