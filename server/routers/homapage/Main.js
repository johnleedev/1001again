const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../common/db');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
const multer  = require('multer')
var fs = require("fs");

const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');

// 메인 데이터
router.get('/getmaininfo', async (req, res) => {
  var { id } = req.body;
  const query = `
    SELECT * FROM mainInfo;
  `;
  db.query(query, function (error, result) {
    if (error) {
      throw error;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.send(false);
    }
    res.end();
  });
});

// 메인 데이터 수정하기
router.post('/updatemaininfo', async (req, res) => {
  const {
    id,
    name,
    charger,
    address,
    youtube,
    blog,
    facebook,
    quiry,
    supportAccount,
    imageMainName,
    imageText,
    mainLogo,
    mainLogoMini,
    greeting,
    mainMessage,
    mainService,
    facility,
    placeNaver,
    placeKakao
  } = req.body;

  try {
    const query = `
      UPDATE mainInfo SET
        name = ?,
        charger = ?,
        address = ?,
        youtube = ?,
        blog = ?,
        facebook = ?,
        quiry = ?,
        supportAccount = ?,
        imageMainName = ?,
        imageText = ?,
        mainLogo = ?,
        mainLogoMini = ?,
        greeting = ?,
        mainMessage = ?,
        mainService = ?,
        facility = ?,
        placeNaver = ?,
        placeKakao = ?
      WHERE id = ?
    `;
    const params = [
      name,
      charger,
      address,
      youtube,
      blog,
      facebook,
      quiry,
      supportAccount,
      imageMainName,
      imageText,
      mainLogo,
      mainLogoMini,
      greeting,
      mainMessage,
      mainService,
      facility,
      placeNaver,
      placeKakao,
      id
    ];
    db.query(query, params, function (error, result) {
      if (error) { throw error }
      if (result.affectedRows > 0) {
        res.send(true);
        res.end();
      } else {
        res.send(false);
        res.end();
      }
    });
  } catch (error) {
    res.send(false);
    res.end();
  }
});

// 업로드 저장소 설정
const noticeStorage = multer.diskStorage({
  destination(req, file, done) {
    done(null, 'build/images/notice');
  },
  filename(req, file, done) {
    done(null, file.originalname);
  }
});

const galleryStorage = multer.diskStorage({
  destination(req, file, done) {
    done(null, 'build/images/gallery');
  },
  filename(req, file, done) {
    done(null, file.originalname);
  }
});

const mainImageStorage = multer.diskStorage({
  destination(req, file, done) {
    done(null, 'build/images/mainimages');
  },
  filename(req, file, done) {
    done(null, file.originalname);
  }
});

const uploadNotice = multer({ storage: noticeStorage });
const uploadGallery = multer({ storage: galleryStorage });
const uploadMainImage = multer({ storage: mainImageStorage });

// 이미지 업로드 엔드포인트
router.post('/upload/notice', uploadNotice.single('img'), (req, res) => {
  if (!req.file) {
    res.send(false);
    return res.end();
  }
  res.json({ filename: req.file.originalname });
  res.end();
});

router.post('/upload/gallery', uploadGallery.array('img'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.send(false);
    return res.end();
  }
  const filenames = req.files.map(f => f.originalname);
  res.json({ filenames });
  res.end();
});

router.post('/upload/mainimage', uploadMainImage.single('img'), (req, res) => {
  if (!req.file) {
    res.send(false);
    return res.end();
  }
  res.json({ filename: req.file.originalname });
  res.end();
});


// 갤러리
router.get('/getgallery', async (req, res) => {
  
  const query = `
    SELECT * FROM gallery;
  `;
  db.query(query, function (error, result) {
    if (error) {
      throw error;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.send(false);
    }
    res.end();
  });
});

// 갤러리 업데이트 (images 전체 교체)
router.post('/gallery/update', async (req, res) => {
  const { id, images } = req.body; // images: JSON string
  try {
    const query = `UPDATE gallery SET images = ? WHERE id = ?`;
    db.query(query, [images, id], function (error, result) {
      if (error) { throw error }
      if (result.affectedRows > 0) {
        res.send(true);
        res.end();
      } else {
        res.send(false);
        res.end();
      }
    });
  } catch (error) {
    res.send(false);
    res.end();
  }
});



// 후원/실습
router.get('/getpractice', async (req, res) => {

  const query = `
    SELECT * FROM practice;
  `;
  db.query(query, function (error, result) {
    if (error) {
      throw error;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.send(false);
    }
    res.end();
  });
});

// 실습/후원 업데이트
router.post('/practice/update', async (req, res) => {
  const { id, title, contentSort, content, date } = req.body;
  try {
    const query = `
      UPDATE practice SET
        title = ?,
        contentSort = ?,
        content = ?,
        date = ?
      WHERE id = ?
    `;
    const params = [title, contentSort, content, date, id];
    db.query(query, params, function (error, result) {
      if (error) { throw error }
      if (result.affectedRows > 0) {
        res.send(true);
        res.end();
      } else {
        res.send(false);
        res.end();
      }
    });
  } catch (error) {
    res.send(false);
    res.end();
  }
});




module.exports = router;
