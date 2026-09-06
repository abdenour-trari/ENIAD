const db = require('./db');

console.log('Seeding data...');

// Clear existing data (optional, but good for demo)
db.prepare('DELETE FROM annonces').run();
db.prepare('DELETE FROM projects').run();
db.prepare('DELETE FROM favorites').run();

// Seed Annonces
const insertAnnonce = db.prepare('INSERT INTO annonces (title, description, price, location) VALUES (?, ?, ?, ?)');
insertAnnonce.run('Colocation Centre-Ville', 'Superbe appartement 3 pièces, proche métro.', 450, 'Casablanca');
insertAnnonce.run('Chambre Étudiante', 'Proche université, tout inclus.', 300, 'Rabat');

// Seed Projects
const insertProject = db.prepare('INSERT INTO projects (title, description, techStack, author, link) VALUES (?, ?, ?, ?, ?)');
insertProject.run('Portfolio IA', 'Un portfolio utilisant React et OpenAI.', 'React, OpenAI, Tailwind', 'Moi', 'https://github.com');
insertProject.run('App Mobile Fitness', 'Suivi de nutrition et sport.', 'Flutter, Firebase', 'Team AEI', 'https://aei.ma');

// Seed Favorites
const insertFavorite = db.prepare('INSERT INTO favorites (courseId, courseTitle) VALUES (?, ?)');
insertFavorite.run('math101', 'Analyse Mathématique I');
insertFavorite.run('ia202', 'Introduction au Machine Learning');

console.log('Data seeded successfully!');
process.exit(0);
