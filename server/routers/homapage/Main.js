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

const escapeQuotes = (str) => {
  if (!str) return '';
  return str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
};

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
    // 디렉토리가 존재하지 않으면 생성
    const dir = 'build/images/notice';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    done(null, dir);
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
  try {
    res.json({ filename: req.file.originalname });
    res.end();
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.send(false);
    res.end();
  }
});

router.post('/upload/gallery', uploadGallery.array('img'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.send(false);
    return res.end();
  }
  try {
    const filenames = req.files.map(f => f.originalname);
    res.json({ filenames });
    res.end();
  } catch (error) {
    console.error('갤러리 이미지 업로드 오류:', error);
    res.send(false);
    res.end();
  }
});

router.post('/upload/mainimage', uploadMainImage.single('img'), (req, res) => {
  if (!req.file) {
    res.send(false);
    return res.end();
  }
  try {
    res.json({ filename: req.file.originalname });
    res.end();
  } catch (error) {
    console.error('메인 이미지 업로드 오류:', error);
    res.send(false);
    res.end();
  }
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

// 이미지 삭제 API
router.post('/deleteimage', async (req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    res.send(false);
    res.end();
    return;
  }

  try {
    // 파일 경로 설정 - build 폴더 내의 경로 사용
    const filePath = `./build/images/notice/${filename}`;
    
    // 파일이 존재하는지 확인
    if (fs.existsSync(filePath)) {
      // 파일 삭제 - 비동기 방식으로 변경
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('파일 삭제 중 오류:', err);
          res.send(false);
          res.end();
        } else {
          console.log(`이미지 파일 삭제됨: ${filename}`);
          res.send(true);
          res.end();
        }
      });
    } else {
      console.log(`파일을 찾을 수 없음: ${filename}`);
      res.send(false);
      res.end();
    }
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
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

// 개별 서비스 항목 업데이트
router.post('/updateserviceitem', async (req, res) => {
  const { id, title, content, image, index, action } = req.body;
  
  try {
    // 먼저 현재 mainService 데이터를 가져옴
    const getQuery = `SELECT mainService FROM mainInfo WHERE id = ?`;
    db.query(getQuery, [id], function (error, result) {
      if (error) { 
        console.error('서비스 데이터 조회 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      
      if (result.length === 0) {
        res.send(false);
        res.end();
        return;
      }
      
      try {
        // JSON 파싱
        const mainServiceList = JSON.parse(result[0].mainService || '[]');
        
        if (action === 'delete') {
          // 삭제 액션
          if (index >= 0 && index < mainServiceList.length) {
            mainServiceList.splice(index, 1);
          }
        } else {
          // 업데이트 또는 추가 액션
          if (index >= 0 && index < mainServiceList.length) {
            // 기존 항목 업데이트
            mainServiceList[index] = {
              title: title || '',
              content: content || [],
              image: image || ''
            };
          } else {
            // 새 항목 추가
            mainServiceList.push({
              title: title || '',
              content: content || [],
              image: image || ''
            });
          }
        }
        
        // 업데이트된 데이터를 다시 저장
        const updateQuery = `UPDATE mainInfo SET mainService = ? WHERE id = ?`;
        const updatedMainService = JSON.stringify(mainServiceList);
        
        db.query(updateQuery, [updatedMainService, id], function (updateError, updateResult) {
          if (updateError) {
            console.error('서비스 항목 업데이트 오류:', updateError);
            res.send(false);
            res.end();
            return;
          }
          
          if (updateResult.affectedRows > 0) {
            res.send(true);
            res.end();
          } else {
            res.send(false);
            res.end();
          }
        });
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        res.send(false);
        res.end();
      }
    });
  } catch (error) {
    console.error('서비스 항목 업데이트 오류:', error);
    res.send(false);
    res.end();
  }
});




module.exports = router;
