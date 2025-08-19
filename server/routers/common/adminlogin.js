const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('./db');
const argon2 = require('argon2');


// 관리자 로그인
router.post('/loginadmin', async (req, res) => {
  const { userId, passwd } = req.body;
  const resultData = {};
  try {
    db.query(`
      SELECT * FROM adminUser WHERE userId = '${userId}';
      `, async function(error, result){
      if (error) {throw error}
      if (result.length > 0) {
        try {
          if (await argon2.verify(result[0].passwd, passwd)) {
            resultData.success = true;
            resultData.name = result[0].name;
            resultData.userId = result[0].userId;
            resultData.auth = result[0].auth;
            res.json(resultData);
            res.end();
          } else {
            resultData.success = false;
            resultData.which = 'passwd'
            res.json(resultData);
            res.end();
          }
        } catch (err) {
          throw err
        }
      } else {
        resultData.succeses = false;
        resultData.which = 'id'
        res.json(resultData);
        res.end();
      }
    });
  } catch (error) {
    console.error(error);
    res.send(false);
    res.end();
  }
});


// 관리자 가입하기 
router.post('/logisteradmin', async (req, res) => {
  const { name, userId, passwd } = req.body;
  const hashedtext = await argon2.hash(passwd);
    try {
    db.query(`
      INSERT IGNORE INTO adminUser (name, userId, passwd) VALUES 
      ('${name}', '${userId}', '${hashedtext}');
      `,function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {      
        res.send(true);
        res.end();
      } else {
        res.send(false);  
        res.end();
    }})
  } catch {
    console.log('error')
  }

});


module.exports = router;