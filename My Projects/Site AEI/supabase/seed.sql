-- supabase/seed.sql
-- Initial seed data for Site AEI

-- 1. Insert Forum Categories
insert into public.forum_categories (name, description) values
  ('Général', 'Discussions générales sur la vie étudiante et le campus.'),
  ('Cours & Supports', 'Questions de cours, partages de fiches de révision et entraide académique.'),
  ('Projets & Tech', 'Partage de projets informatiques, hackathons, et questions de programmation.'),
  ('Logements & Colocations', 'Offres et recherches de colocations ou appartements.'),
  ('Stages & Opportunités', 'Partage d''offres de stages, alternance, et conseils pour les entretiens.');

-- 2. Insert Courses
insert into public.courses (title, niveau, pdf_url, category, description) values
  ('Analyse 1', 'CP1', 'analyse1.pdf', 'Math', 'Introduction aux fonctions, limites, dérivées et continuité. Base fondamentale pour les études scientifiques.'),
  ('Algèbre Linéaire', 'CP1', 'algebre.pdf', 'Math', 'Vecteurs, matrices, systèmes linéaires et espaces vectoriels. Indispensable pour l’IA et l’ingénierie.'),
  ('Analyse 2', 'CP2', 'analyse2.pdf', 'Math', 'Intégration, séries numériques, suites et applications en physique et traitement du signal.'),
  ('Équations Différentielles', 'CP2', 'equations_diff.pdf', 'Math', 'Étude des équations différentielles ordinaires et leurs applications en modélisation et dynamique.'),
  ('Probabilités', 'CP2', 'proba.pdf', 'Statistiques', 'Variables aléatoires, lois de probabilité et espérance. Fondamentaux pour la Data Science.'),
  ('Statistiques Descriptives', 'CI', 'stat_desc.pdf', 'Statistiques', 'Analyse et visualisation des données : moyennes, variances, histogrammes et indicateurs clés.'),
  ('Statistiques Inférentielles', 'CI', 'stat_inf.pdf', 'Statistiques', 'Tests d’hypothèses, intervalles de confiance et estimation. Base des modèles IA prédictifs.'),
  ('Machine Learning', 'CI', 'ml.pdf', 'IA', 'Supervisé, non supervisé, régression, classification. Construction et évaluation de modèles ML.'),
  ('Deep Learning', 'CI', 'dl.pdf', 'IA', 'Réseaux neuronaux, CNN, RNN et architectures modernes. Applications en vision et NLP.'),
  ('Introduction à Python', 'CP1', 'python_intro.pdf', 'Informatique', 'Bases du langage Python : variables, boucles, fonctions et manipulation des données.'),
  ('Structures de Données', 'CP2', 'structures.pdf', 'Informatique', 'Listes, piles, arbres, graphes et algorithmes essentiels pour l’optimisation et l’IA.'),
  ('Systèmes d''Exploitation', 'CI', 'os.pdf', 'Informatique', 'Fonctionnement des OS : processus, mémoire, fichiers et gestion matérielle.'),
  ('Électromagnétisme', 'CP1', 'electro.pdf', 'Physique', 'Champs électriques et magnétiques, forces et applications en électronique.'),
  ('Mécanique du point', 'CP1', 'meca.pdf', 'Physique', 'Forces, énergie, mouvement et lois de Newton. Base de toute modélisation physique.'),
  ('Thermodynamique', 'CP2', 'thermo.pdf', 'Physique', 'Étude des systèmes thermiques : chaleur, énergie, entropie et transformations.'),
  ('Anglais Technique', 'CI', 'anglais.pdf', 'Langues', 'Anglais scientifique et professionnel : vocabulaire technique et communication internationale.'),
  ('Communication Professionnelle', 'CP2', 'communication.pdf', 'Langues', 'Techniques d’expression orale et écrite, présentation, CV et communication en entreprise.');

-- 3. Insert Events
insert into public.events (title, date_text, description, image_url) values
  ('Journée d’intégration', 'Octobre 2025', 'Accueil des nouveaux étudiants et activités culturelles.', '/src/assets/events/event1.png'),
  ('Hackathon IA', 'Novembre 2025', 'Compétition autour de l’intelligence artificielle.', '/src/assets/events/event2.png'),
  ('Conférence Entrepreneuriat', 'Décembre 2025', 'Rencontre avec des entrepreneurs et startups.', '/src/assets/events/event3.png');

-- 4. Insert Advertisements
insert into public.advertisements (title, description, image_url, link, status) values
  ('Sponsor Officiel Dell', 'Bénéficiez de 15% de réduction sur la gamme XPS pour les étudiants de l''AEI.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600', 'https://dell.com', 'active'),
  ('Formation Certification AWS', 'Devenez Cloud Practitioner certifié grâce aux ateliers gratuits le weekend.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600', 'https://aws.amazon.com', 'active');
