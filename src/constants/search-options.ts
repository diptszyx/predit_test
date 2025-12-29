import {
  PolymarketApiSortBy,
  PolymarketSortOrder,
} from "../services/polymarket.service";

export type PolymarketSortOptionId =
  | "volume_desc"
  | "volume_asc"
  | "end_date_asc"
  | "end_date_desc"
  | "liquidity_desc"
  | "liquidity_asc";

export const POLYMARKET_SORT_OPTIONS: Record<
  PolymarketSortOptionId,
  { label: string; sortBy: PolymarketApiSortBy; sortOrder: PolymarketSortOrder }
> = {
  volume_desc: {
    label: "Volume (High → Low)",
    sortBy: "volume",
    sortOrder: "desc",
  },
  volume_asc: {
    label: "Volume (Low → High)",
    sortBy: "volume",
    sortOrder: "asc",
  },
  end_date_asc: {
    label: "End Date (Soonest First)",
    sortBy: "endDate",
    sortOrder: "asc",
  },
  end_date_desc: {
    label: "End Date (Latest First)",
    sortBy: "endDate",
    sortOrder: "desc",
  },
  liquidity_desc: {
    label: "Liquidity (High → Low)",
    sortBy: "liquidity",
    sortOrder: "desc",
  },
  liquidity_asc: {
    label: "Liquidity (Low → High)",
    sortBy: "liquidity",
    sortOrder: "asc",
  },
};
