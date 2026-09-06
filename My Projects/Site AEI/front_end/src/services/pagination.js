// src/services/pagination.js
import { apiFetch } from "../lib/api";

/**
 * Fetch a paginated range of housing announcements from the backend API.
 * @param {object} params { page, size, filters }
 * @returns {Promise<{ items: Array, totalCount: number, hasMore: boolean }>}
 */
export async function fetchPaginatedHousing({ page = 0, size = 12, filters = {} }) {
  const start = page * size;
  const end = start + size - 1;
  
  const queryParams = new URLSearchParams();
  queryParams.append("start", start.toString());
  queryParams.append("end", end.toString());
  
  // Append all active filters
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.append(key, val.toString());
    }
  });

  return apiFetch(`/api/housing?${queryParams.toString()}`);
}

/**
 * Fetch a paginated range of marketplace products from the backend API.
 * @param {object} params { page, size, filters }
 * @returns {Promise<{ items: Array, totalCount: number, hasMore: boolean }>}
 */
export async function fetchPaginatedMarketplace({ page = 0, size = 12, filters = {} }) {
  const start = page * size;
  const end = start + size - 1;
  
  const queryParams = new URLSearchParams();
  queryParams.append("start", start.toString());
  queryParams.append("end", end.toString());
  
  // Append all active filters
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.append(key, val.toString());
    }
  });

  return apiFetch(`/api/marketplace?${queryParams.toString()}`);
}
