import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const isAuthRequest =
      config.url === "login/" ||
      config.url === "register/" ||
      config.url === "token/refresh/";

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // If access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refresh_token");

      // No refresh token → reject
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return Promise.reject(error);
      }

      try {
        // Request new access token
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken =
          response.data.access;

        // Save new access token
        localStorage.setItem(
          "access_token",
          newAccessToken
        );

        // Update original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token also expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;