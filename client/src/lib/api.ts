import { apiRequest } from "./queryClient";

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest("POST", "/api/auth/login", credentials),
  
  register: (userData: { email: string; password: string; name: string; company?: string }) =>
    apiRequest("POST", "/api/auth/register", userData),
  
  logout: () => apiRequest("POST", "/api/auth/logout"),
  
  getMe: () => apiRequest("GET", "/api/auth/me"),

  // Apps
  getApps: () => apiRequest("GET", "/api/apps"),
  
  getApp: (id: string) => apiRequest("GET", `/api/apps/${id}`),
  
  downloadApp: (id: string) => apiRequest("POST", `/api/apps/${id}/download`),
  
  createApp: (appData: any) => apiRequest("POST", "/api/apps", appData),
  
  updateApp: (id: string, appData: any) => apiRequest("PUT", `/api/apps/${id}`, appData),
  
  getDeveloperApps: () => apiRequest("GET", "/api/developer/apps"),

  // Payments
  initializePayment: (appId: string) => 
    apiRequest("POST", "/api/payments/initialize", { appId }),
  
  verifyPayment: (reference: string) =>
    apiRequest("POST", "/api/payments/verify", { reference }),

  // Admin
  getAllApps: () => apiRequest("GET", "/api/admin/apps"),
  
  updateAppStatus: (id: string, status: string) =>
    apiRequest("PUT", `/api/admin/apps/${id}/status`, { status }),
};
