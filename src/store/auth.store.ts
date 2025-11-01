import { AxiosError } from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import apiClient, {
  AUTH_TOKEN_STORAGE_KEY,
} from "../lib/axios";
import type { User } from "../lib/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticating: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  authenticateWithToken: (token: string) => Promise<User>;
  fetchCurrentUser: () => Promise<User | null>;
  logout: () => void;
  setUser: (user: User | null, accessToken?: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

const initialState: Pick<
  AuthState,
  "user" | "accessToken" | "isAuthenticating" | "error"
> = {
  user: null,
  accessToken: null,
  isAuthenticating: false,
  error: null,
};

const safeStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  } as Storage;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      async login(credentials) {
        set({ isAuthenticating: true, error: null });

        try {
          const { data } = await apiClient.post<AuthResponse>(
            "/auth/login",
            credentials
          );

          const { token, user } = data;

          if (typeof window !== "undefined") {
            window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
          }
          apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

          set({
            user,
            accessToken: token,
            isAuthenticating: false,
            error: null,
          });

          return user;
        } catch (error) {
          let errorMessage = "Unable to login. Please try again.";
          if (error instanceof AxiosError) {
            const apiMessage =
              (error.response?.data as { message?: string } | undefined)
                ?.message;
            if (apiMessage) {
              errorMessage = apiMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
          }

          if (typeof window !== "undefined") {
            window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          }

          delete apiClient.defaults.headers.common.Authorization;

          set({
            ...initialState,
            error: errorMessage,
          });

          throw error;
        }
      },
      async authenticateWithToken(token) {
        set({
          isAuthenticating: true,
          error: null,
          accessToken: token,
        });

        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        try {
          const user = await get().fetchCurrentUser();
          if (!user) {
            throw new Error("Unable to load your profile. Please try again.");
          }

          set({
            user,
            accessToken: token,
            isAuthenticating: false,
            error: null,
          });

          return user;
        } catch (error) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          }
          delete apiClient.defaults.headers.common.Authorization;

          let errorMessage = "Authentication failed. Please try again.";
          if (error instanceof AxiosError) {
            const apiMessage =
              (error.response?.data as { message?: string } | undefined)
                ?.message;
            if (apiMessage) {
              errorMessage = apiMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
          } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
          }

          set({
            ...initialState,
            error: errorMessage,
          });

          throw error;
        }
      },
      async fetchCurrentUser() {
        try {
          const { data } = await apiClient.get<User>("/auth/me");
          set({
            user: data,
            error: null,
          });
          return data;
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 401) {
            get().logout();
            return null;
          }

          let errorMessage = "Failed to load your profile.";
          if (error instanceof AxiosError) {
            const apiMessage =
              (error.response?.data as { message?: string } | undefined)
                ?.message;
            if (apiMessage) {
              errorMessage = apiMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
          } else if (error instanceof Error && error.message) {
            errorMessage = error.message;
          }

          set({ error: errorMessage });
          return null;
        } finally {
          set({ isAuthenticating: false });
        }
      },
      logout() {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }

        delete apiClient.defaults.headers.common.Authorization;

        set({ ...initialState });
      },
      setUser(user, accessToken) {
        const tokenToPersist =
          typeof accessToken === "undefined" ? get().accessToken : accessToken;

        set({
          user,
          accessToken: tokenToPersist ?? null,
        });

        if (typeof window !== "undefined") {
          if (tokenToPersist) {
            window.localStorage.setItem(
              AUTH_TOKEN_STORAGE_KEY,
              tokenToPersist,
            );
            apiClient.defaults.headers.common.Authorization = `Bearer ${tokenToPersist}`;
          } else {
            window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            delete apiClient.defaults.headers.common.Authorization;
          }
        }
      },
      updateUser(updates) {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });
      },
      clearError() {
        set({ error: null });
      },
    }),
    {
      name: "deor-auth",
      storage: createJSONStorage(safeStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.accessToken) return;

        const token = state.accessToken;

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        if (typeof window !== "undefined") {
          const existingToken = window.localStorage.getItem(
            AUTH_TOKEN_STORAGE_KEY,
          );
          if (!existingToken) {
            window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
          }
        }
      },
    },
  ),
);

export default useAuthStore;
