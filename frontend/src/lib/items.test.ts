import { describe, expect, it } from "vitest"

import { completion, statusLabel, totalsByStatus } from "./items"

describe("statusLabel", () => {
  it("labels each status, and items without one as To do", () => {
    expect(statusLabel("in_progress")).toBe("In progress")
    expect(statusLabel(undefined)).toBe("To do")
  })
})

describe("totalsByStatus", () => {
  it("fills the statuses the API did not return", () => {
    expect(totalsByStatus([{ status: "done", total: 3 }])).toEqual({
      todo: 0,
      in_progress: 0,
      done: 3,
    })
  })
})

describe("completion", () => {
  it("is the share of done items", () => {
    expect(completion({ todo: 1, in_progress: 1, done: 2 })).toBe(50)
  })
})
