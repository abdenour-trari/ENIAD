// api/marketplace/index.js
import { supabaseAdmin, getSupabaseUserClient } from "../_shared/supabaseClient.js";
import { verifyAuth, verifyRole } from "../_shared/authMiddleware.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
      const search = searchParams.get("search");
      const category = searchParams.get("category") || searchParams.get("categorie");
      const sort = searchParams.get("sort");
      const city = searchParams.get("city") || searchParams.get("ville");
      const filterUserId = searchParams.get("user_id");

      // Define necessary columns explicitly (prevent SELECT *)
      const columns = `
        id, user_id, title, description, price, image_url, image_blur, 
        category, status, condition, city, images, views, likes, created_at, updated_at
      `.trim().replace(/\s+/g, " ");

      let query = dbClient
        .from("marketplace_posts")
        .select(`${columns}, author:profiles(full_name, avatar_url)`, { count: "exact" });

      if (filterUserId) {
        query = query.eq("user_id", filterUserId);
      } else {
        query = query.eq("status", "published");
      }

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }
      if (category) {
        query = query.eq("category", category);
      }
      if (city) {
        query = query.eq("city", city);
      }

      if (sort === "Prix: Croissant" || sort === "asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "Prix: Décroissant" || sort === "desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "Ancien" || sort === "old") {
        query = query.order("created_at", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: posts, error, count } = await query.range(start, end);

      if (error) throw error;

      let finalPosts = posts || [];
      let totalCount = count || 0;

      if (totalCount === 0) {
        const baseCategories = ["Informatique", "Téléphone", "Accessoires", "Mobilier", "Livres"];
        const baseConditions = ["neuf", "très bon", "bon", "acceptable"];
        const baseTitles = [
          "Ordinateur Portable Dell",
          "iPhone 12 Pro",
          "Bureau d'étude en bois",
          "Écouteurs sans fil",
          "Chaise de bureau ergonomique"
        ];
        const baseCities = ["Berkane", "Oujda", "Saidia", "Nador"];
        
        let allMocks = [];
        for (let i = 0; i < 1000; i++) {
          const itemCity = baseCities[i % baseCities.length];
          const itemCat = baseCategories[i % baseCategories.length];
          const itemCond = baseConditions[i % baseConditions.length];
          allMocks.push({
            id: `mock-market-${i}`,
            user_id: `mock-user-${i % 5}`,
            title: `${baseTitles[i % baseTitles.length]} (Simulé #${i + 1})`,
            description: `Excellent état, très peu utilisé. Parfait pour les étudiants. Prix négociable dans la limite du raisonnable. Tout équipé.`,
            price: 150 + (i % 20) * 50,
            category: itemCat,
            condition: itemCond,
            city: itemCity,
            images: [
              i % 2 === 0 
                ? "https://images.pexels.com/photos/18105/pexels-photo.jpg" 
                : "https://images.pexels.com/photos/3945662/pexels-photo-3945662.jpeg"
            ],
            image_url: i % 2 === 0 
              ? "https://images.pexels.com/photos/18105/pexels-photo.jpg" 
              : "https://images.pexels.com/photos/3945662/pexels-photo-3945662.jpeg",
            image_blur: null,
            status: "published",
            views: 10 + (i % 30),
            likes: i % 15,
            created_at: new Date(Date.now() - i * 3600000).toISOString(),
            updated_at: new Date().toISOString(),
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
        if (search) {
          allMocks = allMocks.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (category) {
          allMocks = allMocks.filter(item => item.category === category);
        }
        if (city) {
          allMocks = allMocks.filter(item => item.city === city);
        }

        // Apply sorting to mocks
        if (sort === "Prix: Croissant" || sort === "asc") {
          allMocks.sort((a, b) => a.price - b.price);
        } else if (sort === "Prix: Décroissant" || sort === "desc") {
          allMocks.sort((a, b) => b.price - a.price);
        } else if (sort === "Ancien" || sort === "old") {
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
        // Map backend to frontend expectations
        titre: post.title,
        prix: post.price,
        categorie: post.category,
        img: post.image_url || (post.images && post.images[0]) || "https://images.pexels.com/photos/18105/pexels-photo.jpg",
        etat: post.condition === "neuf" ? "Neuf" : post.condition === "très bon" ? "Très bon état" : post.condition === "bon" ? "Bon état" : "État acceptable",
        ville: post.city || "Berkane",
        date: `Il y a ${Math.max(1, Math.round((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)))} jours`
      }));

      return res.status(200).json({
        items: mappedPosts,
        totalCount: totalCount,
        hasMore: end < (totalCount - 1)
      });
    }

    if (req.method === "POST") {
      // Insert new marketplace post
      const user = await verifyAuth(req);
      const { title, description, price, category, condition, city, images, status, image_url } = req.body;

      if (!title || price === undefined || !category) {
        return res.status(400).json({ error: "Champs requis : title, price, category" });
      }

      const { data: newPost, error: insertErr } = await dbClient
        .from("marketplace_posts")
        .insert([{
          user_id: user.id,
          title,
          description,
          price: parseFloat(price),
          category,
          condition: condition || "bon",
          city: city || "Berkane",
          images: images || [],
          image_url: image_url || (images && images[0]) || null,
          status: status || 'published',
          views: 0,
          likes: 0
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;
      return res.status(201).json(newPost);
    }

    if (req.method === "PUT") {
      // Edit post
      const user = await verifyAuth(req);
      const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
      const id = searchParams.get("id");

      if (!id) {
        return res.status(400).json({ error: "L'identifiant (id) du post est requis" });
      }

      const { data: post, error: fetchErr } = await dbClient
        .from("marketplace_posts")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchErr || !post) {
        return res.status(404).json({ error: "Annonce non trouvée" });
      }

      if (post.user_id !== user.id) {
        return res.status(403).json({ error: "Action non autorisée" });
      }

      const { title, description, price, category, condition, city, images, status, image_url } = req.body;

      const { data: updatedPost, error: updateErr } = await dbClient
        .from("marketplace_posts")
        .update({
          title,
          description,
          price: price !== undefined ? parseFloat(price) : undefined,
          category,
          condition,
          city,
          images,
          image_url: image_url || (images && images[0]) || null,
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return res.status(200).json(updatedPost);
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
        .from("marketplace_posts")
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
        .from("marketplace_posts")
        .delete()
        .eq("id", id);

      if (deleteErr) throw deleteErr;
      return res.status(200).json({ success: true, message: "Annonce supprimée" });
    }

    return res.status(405).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Marketplace API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
