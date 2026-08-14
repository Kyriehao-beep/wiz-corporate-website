export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'closed'

/** Canonical ordered list of every inquiry status, for UI enumeration. */
export const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'quoted',
  'won',
  'closed',
]

/** Allowed forward and reopen transitions. Every closing transition requires a reason. */
const ALLOWED: Record<InquiryStatus, InquiryStatus[]> = {
  new: ['contacted', 'closed'],
  contacted: ['quoted', 'closed'],
  quoted: ['won', 'closed'],
  won: ['contacted', 'closed'],
  closed: ['contacted'],
}

export function canTransition(from: InquiryStatus, to: InquiryStatus): boolean {
  if (from === to) return false
  return ALLOWED[from].includes(to)
}

export interface TransitionCommand {
  from: InquiryStatus
  to: InquiryStatus
  reason?: string
}

export type TransitionResult = { success: true } | { success: false; error: string }

export function validateTransition(command: TransitionCommand): TransitionResult {
  if (!canTransition(command.from, command.to)) {
    return { success: false, error: `Cannot move inquiry from ${command.from} to ${command.to}` }
  }
  const isClosing = command.to === 'closed'
  const isReopening = command.from === 'closed' && command.to !== 'closed'
  if ((isClosing || isReopening) && !command.reason?.trim()) {
    return {
      success: false,
      error: isClosing ? 'A closure reason is required' : 'A reopen note is required',
    }
  }
  return { success: true }
}
