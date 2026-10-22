import type { ItemStatus, ItemStatusCount } from "@/client"

export const STATUS_LABELS: Record<ItemStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

export const STATUSES = Object.keys(STATUS_LABELS) as ItemStatus[]

/** Label of an item's status; items created before statuses existed are "To do". */
export function statusLabel(status: ItemStatus | undefined): string {
  return STATUS_LABELS[status ?? "todo"]
}

/** Items per status, with every status present (0 when the API returns no row for it). */
export function totalsByStatus(
  rows: ItemStatusCount[],
): Record<ItemStatus, number> {
  const totals: Record<ItemStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
  }
  for (const row of rows) totals[row.status] += row.total
  return totals
}

/** Share of the items that are done, in percent. */
export function completion(totals: Record<ItemStatus, number>): number {
  const all = totals.todo + totals.in_progress + totals.done
  if (all === 0) {
    return 0
  }
  return Math.round((totals.done / all) * 100)
}
