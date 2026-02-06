import { toast } from "sonner";

const shareMarketOnX = (marketUrl: string) => {
  const text = encodeURIComponent(
    `Market is heating up — the outcome is still wide open.

Which side would you pick?

Watch how this plays out 👇

${marketUrl}

#predit_market #prediction`,
  );
  window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
};

export const handleShareMarket = async (
  e: React.MouseEvent,
  marketUrl: string,
) => {
  e.stopPropagation();
  shareMarketOnX(marketUrl);
  toast.success("Opening X (Twitter) to share this market!");
};
