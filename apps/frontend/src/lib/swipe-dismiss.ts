const SWIPE_DISMISS_THRESHOLD = 96

export function shouldDismissSwipe(deltaX: number, deltaY: number) {
  return deltaX >= SWIPE_DISMISS_THRESHOLD && deltaX > Math.abs(deltaY)
}
