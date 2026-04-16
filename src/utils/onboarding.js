const COMPANY_DRAFT_KEY = "talentlink.company-registration-draft";

export function saveCompanyDraft(draft) {
  sessionStorage.setItem(COMPANY_DRAFT_KEY, JSON.stringify(draft));
}

export function readCompanyDraft() {
  try {
    const raw = sessionStorage.getItem(COMPANY_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCompanyDraft() {
  sessionStorage.removeItem(COMPANY_DRAFT_KEY);
}
