// 클라우드 업로드용 (naver)
var mysql = require('mysql');
var db = mysql.createPool({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : '1001again85050!@',
  database : 'main'
});


module.exports = {
  db
};