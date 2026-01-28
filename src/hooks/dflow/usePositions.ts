import { MarketPosition } from "../../services/dflow.service";

export function centsLabel(priceUSD: number) {
  const cents = Math.round(priceUSD * 100);
  return `${cents}¢`;
}

export function moneyLabel(usd: number) {
  return usd.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function pctLabel(pct: number) {
  return `${pct.toFixed(2)}%`;
}

export function getKalshiBidAsk(position: MarketPosition) {
  const yesBid = Number(position.market.yesBid);
  const noBid = Number(position.market.noBid);

  const hasYesBid = Number.isFinite(yesBid);
  const hasNoBid = Number.isFinite(noBid);

  const yesAsk = hasNoBid ? 1 - noBid : null;
  const noAsk = hasYesBid ? 1 - yesBid : null;

  return {
    yesBid: hasYesBid ? yesBid : null,
    yesAsk,
    noBid: hasNoBid ? noBid : null,
    noAsk,
  };
}

type PositionType = "YES" | "NO";

export function calculateAvgAndPnL(params: {
  positionType: PositionType;
  shares: number;
  currentUSD: number;

  yesBid?: number | null;
  yesAsk?: number | null;
  noBid?: number | null;
  noAsk?: number | null;
  avgPrice?: number;
}) {
  const {
    positionType,
    shares,
    currentUSD,
    yesBid,
    yesAsk,
    noBid,
    noAsk,
    avgPrice,
  } = params;

  const fallbackAvg =
    positionType === "YES"
      ? yesBid != null && yesAsk != null
        ? (yesBid + yesAsk) / 2
        : null
      : noBid != null && noAsk != null
        ? (noBid + noAsk) / 2
        : null;

  const avgUSD =
    typeof avgPrice === "number" && Number.isFinite(avgPrice)
      ? avgPrice
      : fallbackAvg;

  const pnlUSD = avgUSD != null ? shares * (currentUSD - avgUSD) : null;

  const pnlPct =
    avgUSD != null && avgUSD > 0
      ? ((currentUSD - avgUSD) / avgUSD) * 100
      : null;

  return {
    avgUSD,
    pnlUSD,
    pnlPct,
    isAvgEstimated: avgUSD != null && typeof avgPrice !== "number",
  };
}
