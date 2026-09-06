import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DBService {
  static Future<Database> initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, "favorites.db");

    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
        CREATE TABLE favorites(
          id TEXT PRIMARY KEY,
          name TEXT,
          descrption Text,
          price TEXT,
          imagePath TEXT
        )
      ''');
      },
    );
  }

  static Future<void> addFavorite(Map<String, dynamic> product) async {
    final db = await initDB();
    await db.insert("favorites", product);
  }

  static Future<void> removeFavorite(String id) async {
    final db = await initDB();
    await db.delete('favorites', where: 'id = ? ', whereArgs: [id]);
  }

  static Future<List<Map<String, dynamic>>> getFavorites() async {
    final db = await initDB();
    return db.query("favorites");
  }
}
