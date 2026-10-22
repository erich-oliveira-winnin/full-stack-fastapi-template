import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

import { ItemsService } from "@/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  completion,
  STATUS_LABELS,
  STATUSES,
  totalsByStatus,
} from "@/lib/items"

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
  const totals = totalsByStatus(data.data)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {completion(totals)}% of your items are done
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {STATUS_LABELS[status]}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {totals[status]}
            </CardContent>
          </Card>
        ))}
      </div>
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
