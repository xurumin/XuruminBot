const Database = require('better-sqlite3');

//const db = new Database(__dirname+'/files/guild_info.db', { verbose: console.log });
const db = new Database(__dirname+'/files/guild_info.db');
module.exports = {
    createDatabase(){
        db.exec("CREATE TABLE IF NOT EXISTS `desafios_rinhas` ( `id` INTEGER PRIMARY KEY, `server_id` TEXT NOT NULL, `channel_id` TEXT NOT NULL,`desafiante` TEXT NOT NULL,`desafiado` TEXT NOT NULL, `initialtime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
        db.exec("CREATE TABLE IF NOT EXISTS `galos` ( `id` INTEGER PRIMARY KEY, `server_id` TEXT NOT NULL, `channel_id` TEXT NOT NULL,`desafiante` TEXT NOT NULL,`desafiado` TEXT NOT NULL, `initialtime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
    },
    addChannel(server_id, channel_id, interval){
        const insert = db.prepare('INSERT INTO rinhas (server_id, channel_id, interval) VALUES (?,?,?)');
        insert.run([
            server_id, channel_id, interval
        ]);
    },
    getServer(server_id){
        const stmt  = db.prepare('SELECT * FROM meme_channel WHERE server_id = ?');
        const res = stmt.all(server_id);
        return res;
    },
    async getAll(){
        const stmt  = db.prepare('SELECT * FROM meme_channel');
        const res = stmt.all();
        return res;
    },
    updateChannel(server_id, channel_id, interval){
        const stmt = db.prepare('UPDATE meme_channel SET channel_id=?, interval=? WHERE server_id = ?'); 
        const updates = stmt.run([
            channel_id, interval, server_id
        ]);
    },
    removeServer(server_id){
        const stmt = db.prepare('DELETE FROM meme_channel WHERE server_id = ?'); 
        const updates = stmt.run([
            server_id
        ]);
    }
};