var sql = require('mysql');

function createAdmin(){
    var con = sql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "online_store"
    });
    
    con.connect(function(err){
        if (err) throw err;
        console.log("Connected!");
        con.query("SELECT * from users", (err, rows) => {
            con.query(`UPDATE roles SET role = 3 WHERE userID = ${rows[0].id}`, function (err, result) {
                if (err) throw err;
                console.log("admin role added!");
                con.end();
            });
        });
    });
}

createAdmin();
// if(!process.argv[2] || !process.argv[3]){
//     console.log('Enter your username of your mysql server and password and run command: npm run start USERNAME PASSWORD');
// }else{
//     createAdmin(process.argv[2], process.argv[3]);
// }