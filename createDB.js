var cmd = require('node-cmd');
var sql = require('mysql');

function createDB(username, password){
    var con = sql.createConnection({
        host: "localhost",
        user: username,
        password: password
    });
    
    con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE mama", function (err, result) {
        if (err) throw err;
        console.log("Database created");
    });
    });

    cmd.run(`mysql -u ${username} -p${password} mama < schema.sql`);
}


if(!process.argv[2] || !process.argv[3]) {
    console.log('Enter your username of your mysql server and password and run command: npm run start USERNAME PASSWORD');
}else{
    createDB(process.argv[2], process.argv[3]);
}