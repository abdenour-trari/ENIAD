// src/hooks/useFavorites.js
import { useCallback } from "react";
import { useFavoritesContext } from "../context/FavoritesContext";

export function useFavorites() {
  const context = useFavoritesContext();

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  const {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    loadFavorites,

    courseFavorites,
    courseFavIds,
    toggleCourseFavorite,
    isCourseFavorite,

    housingFavorites,
    housingFavIds,
    toggleHousingFavorite,
    isHousingFavorite,

    marketplaceFavorites,
    marketplaceFavIds,
    toggleMarketplaceFavorite,
    isMarketplaceFavorite,
  } = context;

  // Enforce explicit addFavorite if not already favorited
  const addFavorite = useCallback(
    async (courseId, courseTitle) => {
      if (!isFavorite(courseId)) {
        await toggleFavorite(courseId, courseTitle);
      }
    },
    [isFavorite, toggleFavorite]
  );

  // Enforce explicit removeFavorite if currently favorited
  const removeFavorite = useCallback(
    async (courseId, courseTitle) => {
      if (isFavorite(courseId)) {
        await toggleFavorite(courseId, courseTitle);
      }
    },
    [isFavorite, toggleFavorite]
  );

  return {
    favorites,
    loading,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    loadFavorites,

    courseFavorites,
    courseFavIds,
    toggleCourseFavorite,
    isCourseFavorite,

    housingFavorites,
    housingFavIds,
    toggleHousingFavorite,
    isHousingFavorite,

    marketplaceFavorites,
    marketplaceFavIds,
    toggleMarketplaceFavorite,
    isMarketplaceFavorite,
  };
}

