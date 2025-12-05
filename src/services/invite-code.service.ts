import apiClient from "../lib/axios";

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string | null;
  usedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GenerateInviteCode {
  prefix?: string;
  count: number;
}
export interface GenerateInviteCodeUser {
  appWallet: string;
  prefix?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const inviteCodeService = {
  getStats: async () => {
    const res = await apiClient.get("/invite-codes/stats");
    return res.data;
  },

  getMyCode: async (params: {
    search: string;
    page: number;
    status?: "used" | "unused" | "all";
    limit: number;
  }): Promise<PaginatedResponse<InviteCode>> => {
    const res = await apiClient.get("/invite-codes/my-codes", { params });
    return res.data;
  },

  getAll: async (params: {
    search: string;
    page: number;
    status?: "used" | "unused" | "all";
    limit: number;
  }): Promise<PaginatedResponse<InviteCode>> => {
    const res = await apiClient.get("/invite-codes/all", { params });
    return res.data;
  },

  generateCode: async (payload: GenerateInviteCode): Promise<InviteCode[]> => {
    const res = await apiClient.post("/invite-codes/generate", payload);
    return res.data;
  },

  applyCode: async (code: string): Promise<void> => {
    const res = await apiClient.post("/invite-codes/apply", { code });
    return res.data;
  },

  generateCodeForUser: async (payload: GenerateInviteCodeUser) => {
    const res = await apiClient.post(
      "/invite-codes/admin/generate-for-user",
      payload
    );
    return res.data;
  },
};
