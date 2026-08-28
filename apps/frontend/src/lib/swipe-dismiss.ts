const SWIPE_DISMISS_THRESHOLD = 96

const SWIPE_INTERACTIVE_SELECTOR = "button, a, input, select, textarea, [role='button'], [role='combobox'], [contenteditable='true']"

type SwipeTarget = { closest: (selector: string) => unknown }

export function shouldStartSwipe(swipeEnabled: boolean, pointerType: string, target: SwipeTarget | null) {
  return swipeEnabled && pointerType === "touch" && !target?.closest(SWIPE_INTERACTIVE_SELECTOR)
}

export function shouldDismissSwipe(deltaX: number, deltaY: number) {
  return deltaX >= SWIPE_DISMISS_THRESHOLD && deltaX > Math.abs(deltaY)
}
