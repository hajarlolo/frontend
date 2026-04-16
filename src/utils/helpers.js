export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value, locale = "fr-MA") {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return value;
  }
}

export function mapBackendRedirect(path, fallback = "/login") {
  switch (path) {
    case "/student/verification/requirements":
      return "/student/verification";
    case "/student/profile/options":
      return "/student/profile-setup";
    case "/company/profile/edit":
      return "/company/profile-setup";
    case "/admin/dashboard":
      return "/admin/dashboard";
    case "/student/dashboard":
      return "/student/dashboard";
    case "/company/dashboard":
      return "/company/dashboard";
    case "/email/verify":
      return "/verify-email";
    case "/resubmit-document":
      return "/resubmit-document";
    default:
      return fallback;
  }
}

export function getStorageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "/backend";
  const rootUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  
  const cleanPath = path.replace(/^\/?storage\//, "").replace(/^\//, "");
  return `${rootUrl}/storage/${cleanPath}`;
}
