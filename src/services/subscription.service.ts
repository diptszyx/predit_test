import apiClient from "../lib/axios";

export const subscriptionService = {
  upgradeToPro: async () => {
    try {
      const { data } = await apiClient.post("/subscriptions", {
        plan: "pro",
      });
      window.open(data.paymentUrl, "_blank");
    } catch (error) {
      console.error("Failed to handle payment", error);
    }
  },
};
