import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useInfinitePagination } from "../hooks/useInfinitePagination";
import { fetchPaginatedMarketplace } from "../services/pagination";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";
import { apiFetch } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useFavorites } from "../hooks/useFavorites";

const MarketplaceContext = createContext(null);

export function MarketplaceProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [sort, setSort] = useState("");
  
  const filters = useMemo(() => ({
    search,
    category: filterCat,
    ville: filterVille,
    sort
  }), [search, filterCat, filterVille, sort]);

  // Infinite Scroll Pagination Hook
  const {
    items: products,
    hasMore,
    loading,
    loadMore,
    totalCount
  } = useInfinitePagination({
    queryKey: ["marketplace_posts"],
    fetchFn: fetchPaginatedMarketplace,
    size: 12,
    filters
  });

  // Favorites States & Actions delegated to useFavorites
  const { marketplaceFavorites, toggleMarketplaceFavorite } = useFavorites();

  const favorites = useMemo(() => {
    return new Set(marketplaceFavorites.map((fav) => fav.post_id || fav.postId));
  }, [marketplaceFavorites]);

  const toggleFavorite = useCallback(async (postId) => {
    const product = products.find(p => p.id === postId);
    const title = product?.titre || product?.title || "Produit";
    await toggleMarketplaceFavorite(postId, title);
  }, [products, toggleMarketplaceFavorite]);


  // Log product view
  const logView = async (postId) => {
    try {
      await supabase
        .from("marketplace_views")
        .insert([{ post_id: postId, viewer_id: user?.id || null }]);
    } catch (err) {
      console.error("Error logging view:", err);
    }
  };

  // CRUD Actions
  const publishProduct = async (productData) => {
    const res = await apiFetch("/api/marketplace", {
      method: "POST",
      body: JSON.stringify(productData)
    });
    queryClient.invalidateQueries({ queryKey: ["marketplace_posts"] });
    return res;
  };

  const updateProduct = async (id, productData) => {
    const res = await apiFetch(`/api/marketplace?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(productData)
    });
    queryClient.invalidateQueries({ queryKey: ["marketplace_posts"] });
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await apiFetch(`/api/marketplace?id=${id}`, {
      method: "DELETE"
    });
    queryClient.invalidateQueries({ queryKey: ["marketplace_posts"] });
    return res;
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCat("");
    setFilterVille("");
    setSort("");
  };

  const value = {
    products,
    favorites,
    loading,
    hasMore,
    totalCount,
    search,
    filterCat,
    filterVille,
    sort,
    setSearch,
    setFilterCat,
    setFilterVille,
    setSort,
    loadMore,
    toggleFavorite,
    logView,
    publishProduct,
    updateProduct,
    deleteProduct,
    clearFilters
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplaceContext must be used within a MarketplaceProvider");
  }
  return context;
}
