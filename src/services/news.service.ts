import apiClient from "../lib/axios";
import { OracleEntity } from "./oracles.service";
import { Topic } from "./topic-admin.service";

export interface News {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image: string;
  relevance: string;
  oracle: OracleEntity;
  slug: string;
}

export type CreateNewsValues = {
  title: string;
  content: string;
  topicId: string;
};

export type CreateNewsByPrompt = {
  topicId: string;
  prompt: string;
};

export type GeneratedNewsPreview = {
  title: string;
  content: string;
  topic: Topic;
};

const mockImage = [
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80",
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80",
  "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&q=80",
  "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&q=80",
  "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&q=80",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80",
  "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&q=80",
  "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80",
  "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=400&q=80",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80",
  "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
  "https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=400&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80",
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
  "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=400&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
];

const mockRelevance = ["Hot", "Trending"];

const getRandomImage = (): string => {
  const index = Math.floor(Math.random() * mockImage.length);
  return mockImage[index];
};

const getRandomRelevance = (): string => {
  const index = Math.floor(Math.random() * mockRelevance.length);
  return mockRelevance[index];
};

export const newsService = {
  getNewsList: async (
    oracleId: string,
    topicFilter?: string,
    limit?: number,
    offset?: number,
  ): Promise<News[]> => {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    if (topicFilter !== undefined) params.topic = topicFilter;

    const { data } = await apiClient.get<News[]>(`/news/oracle/${oracleId}`, {
      params,
    });

    return data
      ? data.map((item) => ({
          ...item,
          image: item.image || getRandomImage(),
          relevance: item.relevance || getRandomRelevance(),
        }))
      : [];
  },
  getNewsDetail: async (newsId: string): Promise<News> => {
    const { data } = await apiClient.get<News>(`/news/${newsId}`);
    return {
      ...data,
      image: data.image || getRandomImage(),
      relevance: data.relevance || getRandomRelevance(),
    };
  },
  getBySlug: async (slug: string): Promise<News> => {
    const { data } = await apiClient.get<News>(`/news/slug/${slug}`);
    return {
      ...data,
      image: data.image || getRandomImage(),
      relevance: data.relevance || getRandomRelevance(),
    };
  },
  getAll: async (
    topicFilter?: string,
    limit?: number,
    offset?: number,
  ): Promise<News[]> => {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    if (topicFilter !== undefined) params.topic = topicFilter;

    const { data } = await apiClient.get<News[]>("/news", { params });
    return data
      ? data.map((item) => ({
          ...item,
          image: item.image || getRandomImage(),
          relevance: item.relevance || getRandomRelevance(),
        }))
      : [];
  },
  getRelated: async (newsId: string): Promise<News[]> => {
    const { data } = await apiClient.get<News[]>(`/news/${newsId}/related`);
    return data
      ? data.map((item) => ({
          ...item,
          image: item.image || getRandomImage(),
          relevance: item.relevance || getRandomRelevance(),
        }))
      : [];
  },

  deleteNewsById: async (id: string) => {
    const response = await apiClient.delete(`/news/${id}`);
    return response.status;
  },

  createAdmin: async (news: CreateNewsValues): Promise<News> => {
    const { data } = await apiClient.post<News>("news/create", {
      ...news,
    });
    return {
      ...data,
      image: data.image || getRandomImage(),
      relevance: data.relevance || getRandomRelevance(),
    };
  },

  generateNewsByPrompt: async (createNewsPrompt: CreateNewsByPrompt) => {
    const { data } = await apiClient.post<GeneratedNewsPreview>(
      "news/preview",
      {
        ...createNewsPrompt,
      },
    );

    return data;
  },
};
