import apiClient from "../lib/axios";

export interface CreateTopicValues {
  name: string;
  description: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const topicServices = {
  createTopic: async (data: CreateTopicValues) => {
    const response = await apiClient.post<Topic>("/topics", data);
    return response.data;
  },
  getAllTopics: async () => {
    const response = await apiClient.get<Topic[]>("/topics");
    return response.data;
  },
  updateTopic: async (id: string, data: CreateTopicValues) => {
    const response = await apiClient.patch<Topic>(`/topics/${id}`, data);
    return response.data;
  },
  deleteTopic: async (id: string) => {
    const response = await apiClient.delete(`/topics/${id}`);
    return response.status;
  },
};
