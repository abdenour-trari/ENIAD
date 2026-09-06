// api/projects/index.js
import { supabaseAdmin, getSupabaseUserClient } from "../_shared/supabaseClient.js";
import { verifyAuth, verifyRole } from "../_shared/authMiddleware.js";
import { groq, DEFAULT_CHAT_MODEL } from "../_shared/groqClient.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = url.searchParams.get("action");

  try {
    // Instantiate a user-authenticated DB client if they pass a token, otherwise fallback to admin
    const dbClient = await getSupabaseUserClient(req);

    if (req.method === "GET") {
      const slug = url.searchParams.get("slug");
      const id = url.searchParams.get("id");

      let currentUser = null;
      try {
        currentUser = await verifyAuth(req);
      } catch (e) {
        // Guest user is fine for read-only GET
      }

      // 1. Retrieve single project details if slug or id is provided
      if (slug || id) {
        let dbQuery = dbClient
          .from("projects")
          .select(`
            *,
            author_profile:profiles(id, full_name, avatar_url)
          `);

        if (id) {
          dbQuery = dbQuery.eq("id", id);
        } else {
          dbQuery = dbQuery.eq("slug", slug);
        }

        const { data: project, error: projError } = await dbQuery.maybeSingle();
        if (projError) throw projError;
        if (!project) {
          return res.status(404).json({ error: "Projet non trouvé" });
        }

        // Verify read permissions for draft/private projects
        const isOwner = currentUser && project.user_id === currentUser.id;
        let isCollaborator = false;

        // Fetch related details in parallel
        const [
          { data: versions },
          { data: media },
          { data: tags },
          { data: collaborators },
          { data: comments },
          { data: activity },
          { data: likes },
          { data: bookmarks },
          { data: viewsData }
        ] = await Promise.all([
          dbClient.from("project_versions").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
          dbClient.from("project_media").select("*").eq("project_id", project.id),
          dbClient.from("project_tags").select("*").eq("project_id", project.id),
          dbClient.from("project_collaborators").select("*, profile:profiles(id, full_name, avatar_url)").eq("project_id", project.id),
          dbClient.from("project_comments").select("*, profile:profiles(id, full_name, avatar_url)").eq("project_id", project.id).order("created_at", { ascending: true }),
          dbClient.from("project_activity").select("*, profile:profiles(id, full_name, avatar_url)").eq("project_id", project.id).order("created_at", { ascending: false }),
          dbClient.from("project_likes").select("user_id").eq("project_id", project.id),
          dbClient.from("project_bookmarks").select("user_id").eq("project_id", project.id),
          dbClient.from("project_views").select("id", { count: "exact", head: true }).eq("project_id", project.id)
        ]);

        if (currentUser) {
          isCollaborator = (collaborators || []).some(
            c => c.user_id === currentUser.id && c.status === "accepted"
          );
        }

        if (project.status !== "public" && !isOwner && !isCollaborator) {
          return res.status(403).json({ error: "Ce projet est privé ou en cours de rédaction." });
        }

        // Increment view count asynchronously
        try {
          await supabaseAdmin.from("project_views").insert([{
            project_id: project.id,
            user_id: currentUser?.id || null,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
          }]);
        } catch (viewErr) {
          console.error("View increment error:", viewErr);
        }

        const userLiked = currentUser ? (likes || []).some(l => l.user_id === currentUser.id) : false;
        const userBookmarked = currentUser ? (bookmarks || []).some(b => b.user_id === currentUser.id) : false;

        return res.status(200).json({
          ...project,
          versions: versions || [],
          media: media || [],
          tags: (tags || []).map(t => t.tag),
          collaborators: collaborators || [],
          comments: comments || [],
          activity: activity || [],
          likes_count: (likes || []).length,
          bookmarks_count: (bookmarks || []).length,
          views_count: (viewsData && viewsData.length) || 0,
          user_liked: userLiked,
          user_bookmarked: userBookmarked
        });
      }

      // 2. Retrieve filtered project list
      const q = url.searchParams.get("q");
      const category = url.searchParams.get("category");
      const tag = url.searchParams.get("tag");
      const myProjects = url.searchParams.get("my_projects") === "true";
      const sortBy = url.searchParams.get("sort") || "newest";

      let query = dbClient
        .from("projects")
        .select(`
          *,
          author_profile:profiles(id, full_name, avatar_url)
        `);

      if (myProjects) {
        if (!currentUser) {
          return res.status(401).json({ error: "Authentification requise pour voir vos projets" });
        }
        // Fetch projects where user is owner or accepted collaborator
        const { data: collabs } = await dbClient
          .from("project_collaborators")
          .select("project_id")
          .eq("user_id", currentUser.id)
          .eq("status", "accepted");
        
        const projectIds = (collabs || []).map(c => c.project_id);
        if (projectIds.length > 0) {
          query = query.or(`user_id.eq.${currentUser.id},id.in.(${projectIds.map(id => `"${id}"`).join(",")})`);
        } else {
          query = query.eq("user_id", currentUser.id);
        }
      } else {
        // Public list
        query = query.eq("status", "public");
      }

      if (category && category !== "Toutes" && category !== "All") {
        query = query.eq("category", category);
      }

      if (q) {
        query = query.or(`title.ilike.%${q}%,slogan.ilike.%${q}%,short_description.ilike.%${q}%`);
      }

      if (tag) {
        const { data: tagProjects } = await dbClient
          .from("project_tags")
          .select("project_id")
          .eq("tag", tag);
        
        const taggedIds = (tagProjects || []).map(tp => tp.project_id);
        if (taggedIds.length > 0) {
          query = query.in("id", taggedIds);
        } else {
          // No projects with this tag, return empty
          return res.status(200).json([]);
        }
      }

      const { data: projects, error: projectsErr } = await query;
      if (projectsErr) throw projectsErr;

      if (projects.length === 0) {
        return res.status(200).json([]);
      }

      // Batch load tags, likes and comments for list items
      const projIds = projects.map(p => p.id);
      const [
        { data: allTags },
        { data: allLikes },
        { data: allComments }
      ] = await Promise.all([
        dbClient.from("project_tags").select("*").in("project_id", projIds),
        dbClient.from("project_likes").select("*").in("project_id", projIds),
        dbClient.from("project_comments").select("id, project_id").in("project_id", projIds)
      ]);

      const enriched = projects.map(p => {
        const pTags = (allTags || []).filter(t => t.project_id === p.id).map(t => t.tag);
        const pLikes = (allLikes || []).filter(l => l.project_id === p.id);
        const pCommentsCount = (allComments || []).filter(c => c.project_id === p.id).length;
        const userLiked = currentUser ? pLikes.some(l => l.user_id === currentUser.id) : false;

        return {
          ...p,
          tags: pTags,
          likes_count: pLikes.length,
          comments_count: pCommentsCount,
          user_liked: userLiked
        };
      });

      // Sort results
      if (sortBy === "popular" || sortBy === "top-week") {
        enriched.sort((a, b) => b.likes_count - a.likes_count);
      } else {
        enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return res.status(200).json(enriched);
    }

    if (req.method === "POST") {
      const user = await verifyAuth(req);

      // AI Content Generation
      if (action === "ai_generate") {
        const { title, slogan, category, shortDescription, fullDescription, techStack } = req.body;
        const prompt = `Génère un README professionnel et structuré au format Markdown pour le projet étudiant suivant :
Titre : ${title}
Slogan : ${slogan || "Non spécifié"}
Catégorie : ${category}
Description courte : ${shortDescription || "Non spécifiée"}
Description complète : ${fullDescription || "Non spécifiée"}
Technologies : ${techStack ? techStack.join(', ') : "Non spécifiées"}

Rédige-le entièrement en français. Structure le README de façon moderne (sections : badge de statut, pitch, fonctionnalités majeures avec emojis, architecture technologique, tutoriel de démarrage rapide, contribution, licence). Reste professionnel, dynamique et propre.`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: DEFAULT_CHAT_MODEL,
        });

        const readme = completion.choices[0]?.message?.content || "Impossible de générer le README.";
        return res.status(200).json({ readme });
      }

      // Social Toggle: Like
      if (action === "like") {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: "projectId est requis" });

        const { data: existingLike } = await dbClient
          .from("project_likes")
          .select("id")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingLike) {
          await dbClient.from("project_likes").delete().eq("id", existingLike.id);
          return res.status(200).json({ liked: false });
        } else {
          await dbClient.from("project_likes").insert([{ project_id: projectId, user_id: user.id }]);
          return res.status(200).json({ liked: true });
        }
      }

      // Social Toggle: Bookmark
      if (action === "bookmark") {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: "projectId est requis" });

        const { data: existingBookmark } = await dbClient
          .from("project_bookmarks")
          .select("id")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingBookmark) {
          await dbClient.from("project_bookmarks").delete().eq("id", existingBookmark.id);
          return res.status(200).json({ bookmarked: false });
        } else {
          await dbClient.from("project_bookmarks").insert([{ project_id: projectId, user_id: user.id }]);
          return res.status(200).json({ bookmarked: true });
        }
      }

      // Post Comment
      if (action === "comment") {
        const { projectId, content, parentId } = req.body;
        if (!projectId || !content) {
          return res.status(400).json({ error: "projectId et content sont requis" });
        }

        const { data: newComment, error: commentErr } = await dbClient
          .from("project_comments")
          .insert([{
            project_id: projectId,
            user_id: user.id,
            parent_id: parentId || null,
            content
          }])
          .select(`
            *,
            profile:profiles(id, full_name, avatar_url)
          `)
          .single();

        if (commentErr) throw commentErr;
        return res.status(201).json(newComment);
      }

      // Team Collaboration Request
      if (action === "collaborate") {
        const { projectId, role } = req.body;
        if (!projectId) return res.status(400).json({ error: "projectId est requis" });

        const { data: newCollab, error: collabErr } = await dbClient
          .from("project_collaborators")
          .insert([{
            project_id: projectId,
            user_id: user.id,
            role: role || "contributor",
            status: "pending"
          }])
          .select()
          .single();

        if (collabErr) throw collabErr;
        return res.status(201).json(newCollab);
      }

      // Team Collaboration Response (Accept/Decline)
      if (action === "respond_collaborator") {
        const { projectId, collaboratorUserId, status } = req.body;
        if (!projectId || !collaboratorUserId || !status) {
          return res.status(400).json({ error: "projectId, collaboratorUserId et status sont requis" });
        }

        // Verify ownership
        const { data: project } = await dbClient
          .from("projects")
          .select("user_id")
          .eq("id", projectId)
          .single();

        if (!project || project.user_id !== user.id) {
          return res.status(403).json({ error: "Action non autorisée sur ce projet" });
        }

        const { error: updateCollabErr } = await dbClient
          .from("project_collaborators")
          .update({ status })
          .eq("project_id", projectId)
          .eq("user_id", collaboratorUserId);

        if (updateCollabErr) throw updateCollabErr;

        if (status === "accepted") {
          const { data: profile } = await dbClient
            .from("profiles")
            .select("full_name")
            .eq("id", collaboratorUserId)
            .single();

          await dbClient.from("project_activity").insert([{
            project_id: projectId,
            user_id: user.id,
            activity_type: "collaborator_added",
            description: `${profile?.full_name || "Un collaborateur"} a été ajouté à l'équipe.`
          }]);
        }

        return res.status(200).json({ success: true });
      }

      // Create new Version (Release)
      if (action === "release") {
        const { projectId, versionName, changelog } = req.body;
        if (!projectId || !versionName) {
          return res.status(400).json({ error: "projectId et versionName sont requis" });
        }

        // Check ownership or co-ownership
        const { data: project } = await dbClient
          .from("projects")
          .select("user_id")
          .eq("id", projectId)
          .single();

        const { data: collab } = await dbClient
          .from("project_collaborators")
          .select("role")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .eq("status", "accepted")
          .maybeSingle();

        const isOwner = project && project.user_id === user.id;
        const isCoOwner = collab && collab.role === "co-owner";

        if (!isOwner && !isCoOwner) {
          return res.status(403).json({ error: "Accès refusé. Rôle insuffisant." });
        }

        const { data: newVersion, error: versionErr } = await dbClient
          .from("project_versions")
          .insert([{
            project_id: projectId,
            version_name: versionName,
            changelog: changelog || ""
          }])
          .select()
          .single();

        if (versionErr) throw versionErr;
        return res.status(201).json(newVersion);
      }

      // Standard Create Project
      const {
        title, slug, slogan, category, shortDescription, fullDescription, readmeMarkdown,
        coverUrl, logoUrl, githubLink, websiteLink, figmaLink, docsLink, youtubeLink, status,
        tags, media
      } = req.body;

      if (!title || !slug || !category) {
        return res.status(400).json({ error: "Les champs title, slug et category sont requis" });
      }

      // Ensure slug uniqueness manually if needed, db unique constraint will catch it anyway
      const { data: newProject, error: insertErr } = await dbClient
        .from("projects")
        .insert([{
          user_id: user.id,
          title,
          slug,
          slogan,
          category,
          short_description: shortDescription,
          full_description: fullDescription,
          readme_markdown: readmeMarkdown,
          cover_url: coverUrl,
          logo_url: logoUrl,
          github_link: githubLink,
          website_link: websiteLink,
          figma_link: figmaLink,
          docs_link: docsLink,
          youtube_link: youtubeLink,
          status: status || "public"
        }])
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === "23505") {
          return res.status(400).json({ error: "Le slug du projet existe déjà" });
        }
        throw insertErr;
      }

      // Insert tags if any
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagInserts = tags.map(tag => ({ project_id: newProject.id, tag }));
        await dbClient.from("project_tags").insert(tagInserts);
      }

      // Insert media if any
      if (media && Array.isArray(media) && media.length > 0) {
        const mediaInserts = media.map(m => ({
          project_id: newProject.id,
          url: m.url,
          media_type: m.mediaType
        }));
        await dbClient.from("project_media").insert(mediaInserts);
      }

      return res.status(201).json(newProject);
    }

    if (req.method === "PUT") {
      const user = await verifyAuth(req);
      const {
        id, title, slug, slogan, category, shortDescription, fullDescription, readmeMarkdown,
        coverUrl, logoUrl, githubLink, websiteLink, figmaLink, docsLink, youtubeLink, status,
        tags, media
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "L'identifiant id est requis pour modifier" });
      }

      // Verify owner or co-owner permissions
      const { data: project } = await dbClient
        .from("projects")
        .select("user_id")
        .eq("id", id)
        .single();

      const { data: collab } = await dbClient
        .from("project_collaborators")
        .select("role")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();

      const isOwner = project && project.user_id === user.id;
      const isCoOwner = collab && collab.role === "co-owner";

      if (!isOwner && !isCoOwner) {
        return res.status(403).json({ error: "Action non autorisée sur ce projet" });
      }

      // Update project row
      const { data: updatedProject, error: updateErr } = await dbClient
        .from("projects")
        .update({
          title,
          slug,
          slogan,
          category,
          short_description: shortDescription,
          full_description: fullDescription,
          readme_markdown: readmeMarkdown,
          cover_url: coverUrl,
          logo_url: logoUrl,
          github_link: githubLink,
          website_link: websiteLink,
          figma_link: figmaLink,
          docs_link: docsLink,
          youtube_link: youtubeLink,
          status: status || "public"
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Reset tags
      await dbClient.from("project_tags").delete().eq("project_id", id);
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagInserts = tags.map(tag => ({ project_id: id, tag }));
        await dbClient.from("project_tags").insert(tagInserts);
      }

      // Reset media references
      await dbClient.from("project_media").delete().eq("project_id", id);
      if (media && Array.isArray(media) && media.length > 0) {
        const mediaInserts = media.map(m => ({
          project_id: id,
          url: m.url,
          media_type: m.mediaType
        }));
        await dbClient.from("project_media").insert(mediaInserts);
      }

      // Activity trigger
      await dbClient.from("project_activity").insert([{
        project_id: id,
        user_id: user.id,
        activity_type: "push",
        description: "Mise à jour globale du projet."
      }]);

      return res.status(200).json(updatedProject);
    }

    if (req.method === "DELETE") {
      const user = await verifyAuth(req);
      const id = url.searchParams.get("id");

      if (!id) {
        return res.status(400).json({ error: "L'identifiant du projet est requis" });
      }

      const { data: project } = await dbClient
        .from("projects")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!project) {
        return res.status(404).json({ error: "Projet non trouvé" });
      }

      const isOwner = project.user_id === user.id;
      const isAdmin = await verifyRole(user, ["admin"]);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Action non autorisée" });
      }

      const { error: deleteErr } = await dbClient
        .from("projects")
        .delete()
        .eq("id", id);

      if (deleteErr) throw deleteErr;
      return res.status(200).json({ success: true, message: "Projet supprimé" });
    }

    return res.status(455).json({ error: "Méthode non supportée" });
  } catch (error) {
    console.error("Projects API error:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
