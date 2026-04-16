import { api, ensureCsrfCookie } from "./api";

export const endpoints = {
  // Auth + registration
  registerStudent: "/register/student",
  registerCompany: "/register/company",
  login: "/login",
  logout: "/logout",
  verificationNotice: "/email/verify",
  resendVerificationEmail: "/email/verification-notification",

  // Unified Verification
  verifyCode: "/verification/verify-code",
  uploadDocument: "/verification/upload-document",
  submitStep3: "/verification/submit-step3", // New combined endpoint
  verificationStatus: "/verification/status",
  adminVerificationDecision: (id) => `/admin/verification/${id}/decision`,

  // Universities & Global data
  // Universities & Global data
  universitiesSearch: "/universites/search",
  competencesSearch: "/competences/search",


  // Student onboarding
  studentVerificationRequirements: "/student/verification/requirements",
  studentVerificationUpload: "/student/verification/document",
  studentProfileOptions: "/student/profile/options",
  studentProfileCompleteManual: "/student/profile/complete/manual",
  studentProfileCompleteCv: "/student/profile/complete/cv",
  studentVerifyCode: "/student/verify-email-code",
  studentProfileGet: "/student/profile/data",
  studentProfileUpdatePersonal: "/student/profile/personal-info",
  studentProfileUpdateCompetences: "/student/profile/competences",
  studentProfileUpdateFormations: "/student/profile/formations",
  studentProfileUpdateExperiences: "/student/profile/experiences",
  studentProfileUpdateProjets: "/student/profile/projets",
  studentProfileUpdateCertificats: "/student/profile/certificats",

  // Company onboarding
  companyVerifyCode: "/company/verify-email-code",
  companyProfileEdit: "/company/profile/edit",
  companyProfileComplete: "/company/profile/complete",

  // Admin
  adminAccountDocument: (userId) => `/admin/accounts/${userId}/document`,
  adminAccountModerate: (userId) => `/admin/accounts/${userId}/moderate`,
  adminDashboard: "/admin/dashboard",
  adminCompanies: "/admin/companies",
  adminCandidates: "/admin/candidates",
  adminOffers: "/admin/offers",
  adminLogs: "/admin/logs",
  adminProfile: "/admin/profile",
  notificationsUnreadCount: "/notifications-unread-count",
  notifications: "/notifications",
  markNotificationRead: (id) => `/notifications/${id}`,
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


export async function searchUniversities(term) {
  const query = String(term || "").trim();
  const response = await api.get(endpoints.universitiesSearch, {
    params: { q: query },
  });
  return response.data.map(u => ({ id: u.id_universite, name: `${u.abbreviation} - ${u.nom}` }));
}

export async function fetchAllUniversities() {
  const response = await api.get("/universites");
  return response.data.map(u => ({ id: u.id_universite, name: `${u.abbreviation} - ${u.nom}` }));
}

export async function searchGlobalCompetences(term, type) {
  const query = String(term || "").trim();
  const response = await api.get(endpoints.competencesSearch, {
    params: { q: query, type: type || undefined },
  });
  return response.data;
}

export async function registerStudent(payload) {
  // POST /register/student
  await ensureCsrfCookie();
  const response = await api.post(endpoints.registerStudent, payload);
  return response.data;
}

export async function registerCompany({ payload, isMultipart }) {
  // POST /register/company
  await ensureCsrfCookie();
  const response = await api.post(endpoints.registerCompany, payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
}

export async function login(payload) {
  // POST /login
  await ensureCsrfCookie();
  const response = await api.post(endpoints.login, payload);
  return response.data;
}

export async function logout() {
  // POST /logout
  await ensureCsrfCookie();
  const response = await api.post(endpoints.logout);
  return response.data;
}

export async function getVerificationNotice() {
  // GET /email/verify
  const response = await api.get(endpoints.verificationNotice);
  return response.data;
}

export async function resendVerificationEmail(payload = null) {
  // POST /email/verification-notification
  await ensureCsrfCookie();
  const response = await api.post(endpoints.resendVerificationEmail, payload);
  return response.data;
}

export async function fetchStudentVerificationRequirements() {
  // GET /student/verification/requirements
  const response = await api.get(endpoints.studentVerificationRequirements);
  return response.data;
}

export async function uploadStudentVerificationDocument(formData) {
  // POST /student/verification/document
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentVerificationUpload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function completeStudentProfileManual(payload, isMultipart = false) {
  // POST /student/profile/complete/manual
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileCompleteManual, payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
}

export async function completeStudentProfileCv(formData) {
  // POST /student/profile/complete/cv
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileCompleteCv, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function verifyEmailCode(payload) {
  // POST /verification/verify-code
  await ensureCsrfCookie();
  const response = await api.post(endpoints.verifyCode, payload);
  return response.data;
}

export async function submitStep3(formData) {
  // POST /verification/submit-step3
  await ensureCsrfCookie();
  const response = await api.post(endpoints.submitStep3, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function uploadVerificationDocument(formData) {
  // POST /verification/upload-document
  await ensureCsrfCookie();
  const response = await api.post(endpoints.uploadDocument, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchVerificationStatus(email = null) {
  // GET /verification/status
  const response = await api.get(endpoints.verificationStatus, {
    params: email ? { email } : {},
  });
  return response.data;
}

export async function adminDecisionVerification(id, payload) {
  // POST /admin/verification/{id}/decision
  await ensureCsrfCookie();
  const response = await api.post(endpoints.adminVerificationDecision(id), payload);
  return response.data;
}

export async function verifyStudentCode(payload) {
  return verifyEmailCode(payload);
}

export async function fetchStudentProfile() {
  const response = await api.get(endpoints.studentProfileGet);
  return response.data;
}

export async function updateStudentPersonalInfo(payload, isMultipart = false) {
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileUpdatePersonal, payload, {
    headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
}

export async function updateStudentCompetences(competences) {
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileUpdateCompetences, { competences });
  return response.data;
}

export async function updateStudentFormations(formations) {
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileUpdateFormations, { formations });
  return response.data;
}

export async function updateStudentExperiences(experiences) {
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileUpdateExperiences, { experiences });
  return response.data;
}

export async function updateStudentProjets(payload, isMultipart = false) {
  await ensureCsrfCookie();
  const response = await api.post(
    endpoints.studentProfileUpdateProjets,
    isMultipart ? payload : { projets: payload },
    {
      headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
    }
  );
  return response.data;
}

export async function updateStudentCertificats(certificats) {
  await ensureCsrfCookie();
  const response = await api.post(endpoints.studentProfileUpdateCertificats, { certificats });
  return response.data;
}

export async function verifyCompanyCode(payload) {
  // POST /company/verify-email-code
  await ensureCsrfCookie();
  const response = await api.post(endpoints.companyVerifyCode, payload);
  return response.data;
}

export async function completeCompanyProfile(formData) {
  // POST /company/profile/complete
  await ensureCsrfCookie();
  const response = await api.post(endpoints.companyProfileComplete, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchAdminDashboard(filters) {
  // GET /admin/dashboard?status&role&date_from&date_to
  const response = await api.get(endpoints.adminDashboard, { params: filters });
  return response.data;
}

export async function fetchAccountDocument(userId) {
  // GET /admin/accounts/{user}/document
  const response = await api.get(endpoints.adminAccountDocument(userId));
  return response.data;
}

export async function moderateAccount(userId, payload) {
  // POST /admin/accounts/{user}/moderate
  await ensureCsrfCookie();
  const response = await api.post(endpoints.adminAccountModerate(userId), payload);
  return response.data;
}

export async function fetchAdminCompanies(filters) {
  const response = await api.get(endpoints.adminCompanies, { params: filters });
  return response.data;
}

export async function fetchAdminCandidates(filters) {
  const response = await api.get(endpoints.adminCandidates, { params: filters });
  return response.data;
}

export async function fetchAdminOffers(filters) {
  const response = await api.get(endpoints.adminOffers, { params: filters });
  return response.data;
}

export async function fetchAdminLogs(filters) {
  const response = await api.get(endpoints.adminLogs, { params: filters });
  return response.data;
}

export async function fetchAdminProfile() {
  const response = await api.get(endpoints.adminProfile);
  return response.data;
}

export async function updateAdminProfile(payload) {
  await ensureCsrfCookie();
  const response = await api.put(endpoints.adminProfile, payload);
  return response.data;
}

export async function fetchUnreadNotificationsCount() {
  const response = await api.get(endpoints.notificationsUnreadCount);
  return response.data;
}

export async function fetchNotifications() {
  const response = await api.get(endpoints.notifications);
  return response.data;
}

export async function markNotificationAsRead(id) {
  await ensureCsrfCookie();
  const response = await api.patch(endpoints.markNotificationRead(id));
  return response.data;
}
