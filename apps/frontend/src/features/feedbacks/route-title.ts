export function getHeaderTitle(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/"
  if (path === "/" || path === "/feedbacks") return "Feedbacks"
  if (path.startsWith("/feedbacks/")) return "Detalhes do feedback"
  return "Falaê"
}
