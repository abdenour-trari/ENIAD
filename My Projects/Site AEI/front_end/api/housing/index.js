// api/housing/index.js
import { supabaseAdmin, getSupabaseUserClient } from "../_shared/supabaseClient.js";
import { verifyAuth, verifyRole } from "../_shared/authMiddleware.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const dbClient = await getSupabaseUserClient(req);

    if (req.method === "GET") {
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const start = parseInt(searchParams.get("start") || "0", 10);
      const end = parseInt(searchParams.get("end") || "11", 10);
      const filterUserId = searchParams.get("user_id");
      const city = searchParams.get("city") || searchParams.get("ville");
      const priceSort = searchParams.get("prix") || searchParams.get("price");
      const dateSort = searchParams.get("date");

      // Define necessary columns explicitly (prevent SELECT *)
      const columns = `
        id, user_id, title, description, price, location, quartier, exact_address,
        rooms_available, roommates_count, surface, gender, wifi, parking, clim,
        cuisine, washing_machine, distance_to_campus, close_to_school, charges_included,
        cover_url, cover_blur, status, views, likes, created_at, updated_at, city, images
      `.trim().replace(/\s+/g, " ");

      let query = dbClient
        .from("housing_posts")
        .select(`${columns}, author:profiles(full_name, avatar_url)`, { count: "exact" });

      if (filterUserId) {
        query = query.eq("user_id", filterUserId);
      } else {
        query = query.eq("status", "published");
      }

      if (city) {
        query = query.eq("city", city);
      }

      if (priceSort === "asc") {
        query = query.order("price", { ascending: true });
      } else if (priceSort === "desc") {
        query = query.order("price", { ascending: false });
      } else if (dateSort === "recent") {
        query = query.order("created_at", { ascending: false });
      } else if (dateSort === "old") {
        query = query.order("created_at", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: posts, error, count } = await query.range(start, end);

      if (error) throw error;

      let finalPosts = posts || [];
      let totalCount = count || 0;

      if (totalCount === 0) {
        // If DB has 0 rows, generate all 1000 mock posts, filter and sort them, then slice.
        const baseCities = ["Berkane", "Oujda", "Saidia", "Nador"];
        const baseTitles = [
          "Jolie colocation près du campus",
          "Chambre meublée dans grand appartement",
          "Studio calme idéal étudiant",
          "Colocation conviviale avec terrasse",
          "Appartement moderne proche école"
        ];
        
        let allMocks = [];
        for (let i = 0; i < 1000; i++) {
          const itemCity = baseCities[i % baseCities.length];
          allMocks.push({
            id: `mock-housing-${i}`,
            user_id: `mock-user-${i % 5}`,
            title: `${baseTitles[i % baseTitles.length]} (Simulé #${i + 1})`,
            description: `Grand logement lumineux à proximité immédiate des transports et du campus universitaire. Parfait pour les étudiants de l'AEI. Tout équipé.`,
            price: 1200 + (i % 15) * 100,
            location: itemCity,
            city: itemCity,
            quartier: `Quartier El Qods #${i + 1}`,
            exact_address: `Rue de la Paix, Immeuble ${i + 1}`,
            rooms_available: (i % 3) + 1,
            roommates_count: (i % 4),
            surface: 50 + (i % 6) * 15,
            gender: i % 3 === 0 ? "homme" : i % 3 === 1 ? "femme" : "mixte",
            wifi: i % 2 === 0,
            parking: i % 3 === 0,
            clim: i % 4 === 0,
            cuisine: true,
            washing_machine: i % 2 === 1,
            distance_to_campus: parseFloat((0.2 + (i % 8) * 0.3).toFixed(1)),
            close_to_school: i % 2 === 0,
            charges_included: i % 3 === 1,
            cover_url: i % 2 === 0 
              ? "https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg" 
              : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
            cover_blur: null,
            status: "published",
            views: 12 + (i % 50) * 3,
            likes: 2 + (i % 20),
            created_at: new Date(Date.now() - i * 3600000).toISOString(),
            updated_at: new Date().toISOString(),
            images: [],
            author: {
              full_name: `Étudiant AEI ${i % 10 + 1}`,
              avatar_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`
            }
          });
        }

        // Apply filters to mocks
        if (filterUserId) {
          allMocks = allMocks.filter(item => item.user_id === filterUserId);
        }
        if (city) {
          allMocks = allMocks.filter(item => item.city === city);
        }

        // Apply sorting to mocks
        if (priceSort === "asc") {
          allMocks.sort((a, b) => a.price - b.price);
        } else if (priceSort === "desc") {
          allMocks.sort((a, b) => b.price - a.price);
        } else if (dateSort === "recent") {
          allMocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (dateSort === "old") {
          allMocks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else {
          allMocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        totalCount = allMocks.length;
        finalPosts = allMocks.slice(start, end + 1);
      }

      // Add compatibility fields for existing pages
      const mappedPosts = finalPosts.map(post => ({
        ...post,
        image_url: post.cover_url || post.image_url,
        image: post.cover_url || post.image_url,
        image_blur: post.cover_blur || post.image_blur,
        // Ensure values align with front-end expectation
        nom: post.title,
        ville: post.location,
        prix: post.price,
        desc: post.description,
        type: post.rooms_available > 1 ? "Colocation" : "Studio",
        avatar: post.author?.avatar_url || `https://i.pravatar.cc/150?img=${(Math.abs(post.user_id.charCodeAt(0)) % 70) + 1}`
      }));

      return res.status(200).json({
        items: mappedPosts,
        totalCount: totalCount,
        hasMore: end < (totalCount - 1)
      });
    }

    if (req.method === "POST") {
      // Insert new housing post
      const user = await verifyAuth(req);
      const {
        title,
        description,
        price,
        location,
        rooms_available,
        quartier,
        exact_address,
        roommates_count,
        surface,
        gender,
        wifi,
        parking,
        clim,
        cuisine,
        washing_machine,
        distance_to_campus,
        close_to_school,
        charges_included,
        image_url,
        image_blur,
        city,
        images,
        status
      } = req.body;

      if (!title || !price || !location) {
        return res.status(400).json({ error: "Champs requis : title, price, location" });
      }

      const finalCity = city || location;
      const finalImages = Array.isArray(images) ? images : (image_url ? [image_url] : []);
      const finalStatus = status || "published";

      const { data: newPost, error: insertErr } = await dbClient
        .from("housing_posts")
        .insert([{
          user_id: user.id,
          title,
          description,
          price,
          location,
          rooms_available: rooms_available || 1,
          quartier,
          exact_address,
          roommates_count: roommates_count || 0,
          surface: surface || null,
          gender: gender || "mixte",
          wifi: !!wifi,
          parking: !!parking,
          clim: !!clim,
          cuisine: !!cuisine,
          washing_machine: !!washing_machine,
          distance_to_campus: distance_to_campus || null,
          close_to_school: !!close_to_school,
          charges_included: !!charges_included,
          cover_url: image_url || null,
          cover_blur: image_blur || null,
          city: finalCity,
          images: finalImages,
          status: finalStatus,
          views: 0,
          likes: 0
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      const responsePost = {
        ...newPost,
        image_url: newPost.cover_url,
        image: newPost.cover_url,
        image_blur: newPost.cover_blur
      };

      return res.status(201).json(responsePost);
    }

    if (req.method === "DELETE") {
      // Delete post (owner or mod/admin)
      const user = await verifyAuth(req);
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const id = searchParams.get("id");

      if (!id) {
        return res.status(400).json({ error: "L'identifiant (id) du post est requis" });
      }

      // Check if user is owner or admin/mod
      const { data: post, error: fetchErr } = await dbClient
        .from("housing_posts")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchErr || !post) {
        return res.status(404).json({ error: "Annonce non trouvée" });
      }

      const isOwner = post.user_id === user.id;
      const hasPrivileges = await verifyRole(user, ["admin", "moderator"]);

      if (!isOwner && !hasPrivileges) {
        return res.status(403).json({ error: "Action non autorisée" });
      }

      const { error: deleteErr } = await dbClient
        .from("housing_posts")
        .delete()
        .eq("id", id);

      if (deleteErr) throw deleteErr;
      return res.status(200).json({ success: true, message: "Annonce supprimée" });
    }

    return res.status(455).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Housing API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
