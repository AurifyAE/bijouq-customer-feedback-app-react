const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────
//  Base Fetch Helper
// ─────────────────────────────────────────────

const request = async (path, options = {}, token = null) => {
    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
};

// ─────────────────────────────────────────────
//  Token Storage Helpers
// ─────────────────────────────────────────────

export const getStoredToken = () => localStorage.getItem("bd_token");

export const getStoredAdmin = () => {
    try {
        return JSON.parse(localStorage.getItem("bd_admin"));
    } catch {
        return null;
    }
};

export const saveSession = (token, admin) => {
    localStorage.setItem("bd_token", token);
    localStorage.setItem("bd_admin", JSON.stringify(admin));
};

export const clearSession = () => {
    localStorage.removeItem("bd_token");
    localStorage.removeItem("bd_admin");
};

// ─────────────────────────────────────────────
//  Auth API
// ─────────────────────────────────────────────

// POST /api/auth/login
export const login = async (email, password) => {
    const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    return data; // { status, token, admin }
};

// GET /api/auth/me  — verify stored token on page load
export const verifySession = async (token) => {
    const data = await request("/auth/me", {}, token);
    return data; // { status, admin }
};

// ─────────────────────────────────────────────
//  Feedback / Survey API
// ─────────────────────────────────────────────

// GET /api/feedback?page=&limit=&search=&country=&branch=
export const fetchSurveys = async (token, { page = 1, limit = 20, search = "", country = "", branch = "" } = {}) => {
    const params = new URLSearchParams({
        page,
        limit,
        search,
        country,
        branch,
    });
    const data = await request(`/feedback?${params}`, {}, token);
    return data; // { status, data, total, page, limit, totalPages }
};

// GET /api/feedback/stats
export const fetchStats = async (token) => {
    const data = await request("/feedback/stats", {}, token);
    return data; // { status, data: { summary, byCountry, byBranch } }
};

// GET /api/feedback/:id
export const fetchSurveyById = async (token, id) => {
    const data = await request(`/feedback/${id}`, {}, token);
    return data; // { status, data: survey }
};

// DELETE /api/feedback/:id
export const deleteSurvey = async (token, id) => {
    const data = await request(`/feedback/${id}`, { method: "DELETE" }, token);
    return data; // { status, message }
};

// ─────────────────────────────────────────────
//  CSV Export Helper
// ─────────────────────────────────────────────

export const exportToCSV = (surveys) => {
    const headers = [
        "ID", "Phone", "Country Code", "Country Name", "Full Name",
        "Gov ID (QID)", "Date of Birth", "Heard About Us", "Heard About Us (Other)",
        "Jewelry Collections", "Collections (Other)", "Branch", "Feedback",
        "Language", "Submitted At",
    ];

    const rows = surveys.map((r) => [
        r.id,
        r.phone,
        r.country_code,
        r.country_name,
        r.full_name,
        r.emirates_id || "",
        r.date_of_birth || "",
        r.hear_about_us || "",
        r.hear_about_us_other || "",
        r.jewelry_collections || "",
        r.jewelry_collections_other || "",
        r.blue_diamond_branch || "",
        r.feedback || "",
        r.language,
        new Date(r.submitted_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
        .map((row) =>
            row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bijouq
    _surveys_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};