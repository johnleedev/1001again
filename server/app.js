const express = require('express');
const path = require('path');
const app = express();
const { db } = require('./routers/common/db');

var bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
var cors = require('cors');

// 라우터들
const AdminLoginRouter = require('./routers/common/adminlogin');
app.use('/adminlogin', AdminLoginRouter);


const MainRouter = require('./routers/homapage/Main');
const BoardRouter = require('./routers/homapage/Board');
app.use('/main', MainRouter);
app.use('/board', BoardRouter);
const BackupRouter = require('./routers/homapage/Backup');
app.use('/backup', BackupRouter);



app.use(express.static('build'));
app.use(express.urlencoded({extended: true})) 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.listen(8000, ()=>{
  console.log('server is running')
});


// 앱 상태 가져오기 ////
app.get('/getappstate', (req, res) => {
  db.query(`
  select * from appstate;
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.send(result);
    res.end();
  } else {
    res.send(error);  
    res.end();
  }})
});


// 앱실행시, 접속 수 증가시키기
app.post('/appusecount', (req, res) => {
  const { date } = req.body;
  db.query(`
  select * from appusecount where date = '${date}'
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    db.query(`UPDATE appusecount SET count = count + 1 WHERE date = '${date}'`);
    res.end();
  } else {
    db.query(`INSERT IGNORE INTO appusecount (date, count ) VALUES ('${date}', '1')`);
    res.end();
  }})
});

// 홈페이지 접속시, 접속 수 증가시키기
app.post('/homeusecount', (req, res) => {
  const { date } = req.body;
  db.query(`
  select * from appusecount where date = '${date}'
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    db.query(`UPDATE appusecount SET homecount = homecount + 1 WHERE date = '${date}'`);
    res.end();
  } else {
    db.query(`INSERT IGNORE INTO appusecount (date, homecount ) VALUES ('${date}', '1')`);
    res.end();
  }})
});

// 유저 버전 체크 증가시키기
app.post('/appversioncheck', (req, res) => {
  const { userAccount, version } = req.body;
  db.query(`
  select * from user where userAccount = '${userAccount}' and version = '${version}'
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.end();
  } else {
    db.query(`UPDATE user SET version = '${version}' WHERE userAccount = '${userAccount}'`);
    res.end();
  }})
});



// 리액트 연결하기 ----------------------------------------------------------------- //

app.use(express.static(path.join(__dirname, '/build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});


