import { useMarketplaceContext } from "../context/MarketplaceContext";

/**
 * Accesses global marketplace states, pagination, favorites, and actions.
 */
export function useMarketplace() {
  return useMarketplaceContext();
}
