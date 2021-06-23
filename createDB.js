var cmd = require('node-cmd');
var sql = require('mysql');

function createDB(){
    var con = sql.createConnection({
        host: "localhost",
        user: "root",
        password: "password"
    });
    
    con.connect(function(err){
        if (err) throw err;
        console.log("Connected!");
        con.query("CREATE DATABASE online_store", function (err, result) {
            if (err) throw err;
            console.log("Database created");
            con.end();
        });
    });

    cmd.run(`mysql -u root -ppassword online_store < schema.sql`);
}

createDB();
// if(!process.argv[2] || !process.argv[3]){
//     console.log('Enter your username of your mysql server and password and run command: npm run build USERNAME PASSWORD');
// }else{
//     createDB(process.argv[2], process.argv[3]);
// }