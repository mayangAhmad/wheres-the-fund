export function getRedirectPath(role: string) {
  switch (role) {
    case "ngo": return "/ngo/dashboard";
    case "donor": return "/donor/dashboard";
    default: return "/login";
  }
}
