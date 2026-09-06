// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { useToast } from "../components/ui/toast";

const FavoritesContext = createContext({
  favorites: [],
  favoriteIds: new Set(),
  toggleFavorite: async () => {},
  isFavorite: () => false,

  courseFavorites: [],
  courseFavIds: new Set(),
  toggleCourseFavorite: async () => {},
  isCourseFavorite: () => false,

  housingFavorites: [],
  housingFavIds: new Set(),
  toggleHousingFavorite: async () => {},
  isHousingFavorite: () => false,

  marketplaceFavorites: [],
  marketplaceFavIds: new Set(),
  toggleMarketplaceFavorite: async () => {},
  isMarketplaceFavorite: () => false,

  loading: false,
  loadFavorites: async () => {},
});

export function FavoritesProvider({ children }) {
  const [courseFavorites, setCourseFavorites] = useState([]);
  const [housingFavorites, setHousingFavorites] = useState([]);
  const [marketplaceFavorites, setMarketplaceFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Compute Sets of IDs for O(1) checks in render paths
  const courseFavIds = useMemo(() => {
    return new Set(courseFavorites.map((fav) => fav.course_id || fav.courseId));
  }, [courseFavorites]);

  const housingFavIds = useMemo(() => {
    return new Set(housingFavorites.map((fav) => fav.post_id || fav.postId));
  }, [housingFavorites]);

  const marketplaceFavIds = useMemo(() => {
    return new Set(marketplaceFavorites.map((fav) => fav.post_id || fav.postId));
  }, [marketplaceFavorites]);

  // Load favorites from Supabase
  const loadCourseFavorites = useCallback(async () => {
    if (!user) {
      setCourseFavorites([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("course_favorites")
        .select(`
          id,
          course_id,
          user_id,
          course:courses(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setCourseFavorites(data || []);
    } catch (err) {
      console.error("Error loading course favorites:", err.message);
    }
  }, [user]);

  const loadHousingFavorites = useCallback(async () => {
    if (!user) {
      setHousingFavorites([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("housing_favorites")
        .select(`
          id,
          post_id,
          user_id,
          post:housing_posts(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setHousingFavorites(data || []);
    } catch (err) {
      console.error("Error loading housing favorites:", err.message);
    }
  }, [user]);

  const loadMarketplaceFavorites = useCallback(async () => {
    if (!user) {
      setMarketplaceFavorites([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("marketplace_favorites")
        .select(`
          id,
          post_id,
          user_id,
          post:marketplace_posts(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setMarketplaceFavorites(data || []);
    } catch (err) {
      console.error("Error loading marketplace favorites:", err.message);
    }
  }, [user]);

  const loadAllFavorites = useCallback(async () => {
    if (!user) {
      setCourseFavorites([]);
      setHousingFavorites([]);
      setMarketplaceFavorites([]);
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        loadCourseFavorites(),
        loadHousingFavorites(),
        loadMarketplaceFavorites(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, loadCourseFavorites, loadHousingFavorites, loadMarketplaceFavorites]);

  // Load all when user changes
  useEffect(() => {
    loadAllFavorites();
  }, [loadAllFavorites]);

  // Supabase Realtime Subscription for automatic sync
  useEffect(() => {
    if (!user) return;

    const courseChannel = supabase
      .channel(`course_favorites_sync_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_favorites",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCourseFavorites();
        }
      )
      .subscribe();

    const housingChannel = supabase
      .channel(`housing_favorites_sync_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "housing_favorites",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadHousingFavorites();
        }
      )
      .subscribe();

    const marketplaceChannel = supabase
      .channel(`marketplace_favorites_sync_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marketplace_favorites",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadMarketplaceFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(courseChannel);
      supabase.removeChannel(housingChannel);
      supabase.removeChannel(marketplaceChannel);
    };
  }, [user, loadCourseFavorites, loadHousingFavorites, loadMarketplaceFavorites]);

  // Course favorite actions
  const toggleCourseFavorite = useCallback(async (courseId, courseTitle = "Cours") => {
    if (!user) {
      toast("Connexion requise", "Veuillez vous connecter pour ajouter des favoris.", "error");
      return;
    }

    const isUUID = (str) => typeof str === "string" && str.length === 36 && str.includes("-");
    if (!isUUID(courseId)) {
      toast(
        "Action impossible",
        "Ce cours utilise des identifiants temporaires. Veuillez démarrer le serveur API et importer 'seed.sql' dans Supabase.",
        "error"
      );
      return;
    }

    const isCurrentlyFav = courseFavIds.has(courseId);
    const previousFavorites = [...courseFavorites];

    if (isCurrentlyFav) {
      setCourseFavorites((prev) => prev.filter((fav) => (fav.course_id || fav.courseId) !== courseId));
      toast("Retiré", `"${courseTitle}" a été retiré de vos favoris.`, "info");

      try {
        const { error } = await supabase
          .from("course_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete course favorite:", err);
        setCourseFavorites(previousFavorites);
        toast("Erreur", "Impossible de supprimer des favoris. Réessayez.", "error");
      }
    } else {
      const tempId = Math.random().toString();
      const newFavObj = {
        id: tempId,
        course_id: courseId,
        user_id: user.id,
        course: { id: courseId, title: courseTitle },
      };
      setCourseFavorites((prev) => [...prev, newFavObj]);
      toast("Ajouté", `"${courseTitle}" a été ajouté à vos favoris.`, "success");

      try {
        const { data, error } = await supabase
          .from("course_favorites")
          .insert([{ user_id: user.id, course_id: courseId }])
          .select(`
            id,
            course_id,
            user_id,
            course:courses(*)
          `)
          .single();

        if (error) throw error;
        setCourseFavorites((prev) =>
          prev.map((fav) => (fav.id === tempId ? data : fav))
        );
      } catch (err) {
        console.error("Failed to insert course favorite:", err);
        setCourseFavorites(previousFavorites);
        toast("Erreur", "Impossible d'ajouter aux favoris. Réessayez.", "error");
      }
    }
  }, [user, courseFavorites, courseFavIds, toast]);

  const isCourseFavorite = useCallback((courseId) => {
    return courseFavIds.has(courseId);
  }, [courseFavIds]);


  // Housing favorite actions
  const toggleHousingFavorite = useCallback(async (postId, postTitle = "Colocation") => {
    if (!user) {
      toast("Connexion requise", "Veuillez vous connecter pour ajouter des favoris.", "error");
      return;
    }

    const isCurrentlyFav = housingFavIds.has(postId);
    const previousFavorites = [...housingFavorites];

    if (isCurrentlyFav) {
      setHousingFavorites((prev) => prev.filter((fav) => (fav.post_id || fav.postId) !== postId));
      toast("Retiré", `"${postTitle}" a été retiré de vos favoris.`, "info");

      try {
        const { error } = await supabase
          .from("housing_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete housing favorite:", err);
        setHousingFavorites(previousFavorites);
        toast("Erreur", "Impossible de supprimer des favoris. Réessayez.", "error");
      }
    } else {
      const tempId = Math.random().toString();
      const newFavObj = {
        id: tempId,
        post_id: postId,
        user_id: user.id,
        post: { id: postId, title: postTitle },
      };
      setHousingFavorites((prev) => [...prev, newFavObj]);
      toast("Ajouté", `"${postTitle}" a été ajouté à vos favoris.`, "success");

      try {
        const { data, error } = await supabase
          .from("housing_favorites")
          .insert([{ user_id: user.id, post_id: postId }])
          .select(`
            id,
            post_id,
            user_id,
            post:housing_posts(*)
          `)
          .single();

        if (error) throw error;
        setHousingFavorites((prev) =>
          prev.map((fav) => (fav.id === tempId ? data : fav))
        );
      } catch (err) {
        console.error("Failed to insert housing favorite:", err);
        setHousingFavorites(previousFavorites);
        toast("Erreur", "Impossible d'ajouter aux favoris. Réessayez.", "error");
      }
    }
  }, [user, housingFavorites, housingFavIds, toast]);

  const isHousingFavorite = useCallback((postId) => {
    return housingFavIds.has(postId);
  }, [housingFavIds]);


  // Marketplace favorite actions
  const toggleMarketplaceFavorite = useCallback(async (postId, postTitle = "Produit") => {
    if (!user) {
      toast("Connexion requise", "Veuillez vous connecter pour ajouter des favoris.", "error");
      return;
    }

    const isCurrentlyFav = marketplaceFavIds.has(postId);
    const previousFavorites = [...marketplaceFavorites];

    if (isCurrentlyFav) {
      setMarketplaceFavorites((prev) => prev.filter((fav) => (fav.post_id || fav.postId) !== postId));
      toast("Retiré", `"${postTitle}" a été retiré de vos favoris.`, "info");

      try {
        const { error } = await supabase
          .from("marketplace_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete marketplace favorite:", err);
        setMarketplaceFavorites(previousFavorites);
        toast("Erreur", "Impossible de supprimer des favoris. Réessayez.", "error");
      }
    } else {
      const tempId = Math.random().toString();
      const newFavObj = {
        id: tempId,
        post_id: postId,
        user_id: user.id,
        post: { id: postId, title: postTitle },
      };
      setMarketplaceFavorites((prev) => [...prev, newFavObj]);
      toast("Ajouté", `"${postTitle}" a été ajouté à vos favoris.`, "success");

      try {
        const { data, error } = await supabase
          .from("marketplace_favorites")
          .insert([{ user_id: user.id, post_id: postId }])
          .select(`
            id,
            post_id,
            user_id,
            post:marketplace_posts(*)
          `)
          .single();

        if (error) throw error;
        setMarketplaceFavorites((prev) =>
          prev.map((fav) => (fav.id === tempId ? data : fav))
        );
      } catch (err) {
        console.error("Failed to insert marketplace favorite:", err);
        setMarketplaceFavorites(previousFavorites);
        toast("Erreur", "Impossible d'ajouter aux favoris. Réessayez.", "error");
      }
    }
  }, [user, marketplaceFavorites, marketplaceFavIds, toast]);

  const isMarketplaceFavorite = useCallback((postId) => {
    return marketplaceFavIds.has(postId);
  }, [marketplaceFavIds]);


  const value = useMemo(() => ({
    favorites: courseFavorites, // Legacy support
    favoriteIds: courseFavIds, // Legacy support
    toggleFavorite: toggleCourseFavorite, // Legacy support
    isFavorite: isCourseFavorite, // Legacy support

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

    loading,
    loadFavorites: loadAllFavorites,
  }), [
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
    loading,
    loadAllFavorites,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}
