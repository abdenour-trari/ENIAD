// api/forum/index.js
import { supabaseAdmin } from "../_shared/supabaseClient.js";
import { verifyAuth, verifyRole } from "../_shared/authMiddleware.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const type = searchParams.get("type"); // categories, posts, comments

  try {
    // --- GET ACTIONS ---
    if (req.method === "GET") {
      if (type === "categories") {
        const { data: categories, error } = await supabaseAdmin
          .from("forum_categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        return res.status(200).json(categories);
      }

      if (type === "posts") {
        const categoryId = searchParams.get("categoryId");
        let query = supabaseAdmin
          .from("forum_posts")
          .select(`
            *,
            author:profiles(full_name, avatar_url),
            category:forum_categories(name)
          `);

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data: posts, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        return res.status(200).json(posts);
      }

      if (type === "comments") {
        const postId = searchParams.get("postId");
        if (!postId) {
          return res.status(400).json({ error: "Le paramètre postId est requis" });
        }

        const { data: comments, error } = await supabaseAdmin
          .from("forum_comments")
          .select(`
            *,
            author:profiles(full_name, avatar_url)
          `)
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return res.status(200).json(comments);
      }

      return res.status(400).json({ error: "Type de ressource invalide pour GET" });
    }

    // --- POST ACTIONS ---
    if (req.method === "POST") {
      const user = await verifyAuth(req);

      if (type === "posts") {
        const { title, content, categoryId } = req.body;
        if (!title || !content || !categoryId) {
          return res.status(400).json({ error: "Champs requis : title, content, categoryId" });
        }

        const { data: newPost, error } = await supabaseAdmin
          .from("forum_posts")
          .insert([{
            user_id: user.id,
            category_id: categoryId,
            title,
            content
          }])
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(newPost);
      }

      if (type === "comments") {
        const { postId, content } = req.body;
        if (!postId || !content) {
          return res.status(400).json({ error: "Champs requis : postId, content" });
        }

        const { data: newComment, error } = await supabaseAdmin
          .from("forum_comments")
          .insert([{
            user_id: user.id,
            post_id: postId,
            content
          }])
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(newComment);
      }

      return res.status(400).json({ error: "Type de ressource invalide pour POST" });
    }

    return res.status(455).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Forum API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
