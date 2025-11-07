import apiClient from '../lib/axios';

export const refListService = {
  getRefList: async () => {
    const { data } = await apiClient.get('/xp-events?eventType=invite');
    return data?.events?.length > 0
      ? data?.events?.map((event: any) => event.user)
      : [];
  },
};
