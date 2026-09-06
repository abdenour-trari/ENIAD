import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class Dbservice {
  Future<Database> initDB() async {
    final path = join(await getDatabasesPath(), 'user.db');
    return openDatabase(
      path,
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE etudiants(id INTEGER PRIMARY KEY, nom TEXT, age INTEGER)',
        );
      },
    );
  }

  Future<void> insertUser(Map<String, dynamic> user) async {
    final db = await initDB();
    await db.insert('user', user);
  }

  Future<List<Map<String, dynamic>>> getUser() async {
    final db = await initDB();
    return db.query('user');
  }

  Future<void> deteteUser(int id) async {
    final db = await initDB();
    await db.delete('user', where: 'id = ?', whereArgs: [id]);
  }
}
