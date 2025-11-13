import apiClient from "../lib/axios";

export const subscriptionService = {
  upgradeToPro: async () => {
    try {
      const paymentWindow = window.open("", "_blank");
      const { data } = await apiClient.post("/subscriptions", { plan: "pro" });

      if (paymentWindow) {
        paymentWindow.opener = null;
        paymentWindow.location.href = data.paymentUrl;
      } else {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error("Failed to handle payment", error);
    }
  },
};
