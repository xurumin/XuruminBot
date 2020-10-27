const Database = require('better-sqlite3');

//const db = new Database(__dirname+'/files/guild_info.db', { verbose: console.log });
const db = new Database(__dirname + '/files/rinha.db');
module.exports = {
    createDatabase() {
        db.exec("CREATE TABLE IF NOT EXISTS `rinha` ( `id` INTEGER PRIMARY KEY, `user_id` TEXT NOT NULL, `galoname` TEXT NOT NULL,  `creationDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, `galodf` INTEGER, `galoappl` INTEGER)")
    },
    getGaloByUserId(user_id) {
        const stmt = db.prepare('SELECT * FROM rinha WHERE user_id = ?')
        const res = stmt.all(user_id);
        return res
    },
    insertGalo(user_id, galoname, galodf, galoappl) {
        const insert = db.prepare('INSERT INTO rinha (user_id, galoname, galodf, galoappl) VALUES (?,?,?, ?)');
        insert.run([
            user_id, galoname, galodf, galoappl
        ])
    }
}