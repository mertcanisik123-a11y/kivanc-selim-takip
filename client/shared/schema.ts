// client/src/shared/schema.ts
export type Feed = {
  id: string
  time: string
  amountMl: number
  side?: 'sol' | 'sag' | 'biberon'
  note?: string
}

export const placeholderSchema = { ok: true }
