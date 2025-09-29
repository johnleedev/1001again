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

// 강제 CORS 헤더 (프리플라이트 포함)
router.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
    const dir = 'build/images/gallery';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    done(null, dir);
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


// 갤러리 업로드 전용 미들웨어
const conditionalGalleryUpload = (req, res, next) => {
  if (req.query.galleryImage) {
    uploadGallery.array('img')(req, res, next);
  } else {
    next();
  }
};


// 갤러리 업데이트 (images 전체 교체)
router.post('/gallery/update', conditionalGalleryUpload, async (req, res) => {
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

// 갤러리 단일 항목 업데이트/삭제
router.post('/gallery/updateitem', conditionalGalleryUpload, async (req, res) => {
  const { id, index, image, subtitle, date, action } = req.body;
  const indexNum = Number(index);

  try {
    const getQuery = `SELECT images FROM gallery WHERE id = ?`;
    db.query(getQuery, [id], function (error, result) {
      if (error) {
        console.error('갤러리 데이터 조회 오류:', error);
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
        const list = JSON.parse(result[0].images || '[]');
        if (action === 'delete') {
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < list.length) {
            const oldImage = list[indexNum]?.image;
            list.splice(indexNum, 1);
            // 파일 삭제 시도
            if (oldImage) {
              const filePath = `./build/images/gallery/${oldImage}`;
              if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                  if (err) console.error('갤러리 파일 삭제 오류:', err);
                });
              }
            }
          }
        } else if (action === 'clearImage') {
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < list.length) {
            const oldImage = list[indexNum]?.image;
            if (oldImage) {
              const filePath = `./build/images/gallery/${oldImage}`;
              if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                  if (err) console.error('갤러리 파일 삭제 오류:', err);
                });
              }
            }
            // 이미지 필드만 비우고 항목은 유지
            list[indexNum] = { ...list[indexNum], image: '' };
          }
        } else {
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < list.length) {
            const oldImage = list[indexNum]?.image;
            list[indexNum] = { image: image || oldImage || '', subtitle: subtitle || '', date: date || '' };
            // 교체된 경우 이전 파일 삭제
            if (image && oldImage && image !== oldImage) {
              const filePath = `./build/images/gallery/${oldImage}`;
              if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                  if (err) console.error('갤러리 파일 삭제 오류:', err);
                });
              }
            }
          } else {
            list.push({ image: image || '', subtitle: subtitle || '', date: date || '' });
          }
        }

        const updateQuery = `UPDATE gallery SET images = ? WHERE id = ?`;
        const updated = JSON.stringify(list);
        db.query(updateQuery, [updated, id], function (updateError, updateResult) {
          if (updateError) {
            console.error('갤러리 항목 업데이트 오류:', updateError);
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
    console.error('갤러리 항목 업데이트 오류:', error);
    res.send(false);
    res.end();
  }
});

// 갤러리 이미지 단일 파일 삭제
router.post('/gallery/deleteimage', async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    res.send(false);
    return res.end();
  }
  try {
    const filePath = `./build/images/gallery/${filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('갤러리 파일 삭제 오류:', err);
          res.send(false);
        } else {
          res.send(true);
        }
        res.end();
      });
    } else {
      res.send(false);
      res.end();
    }
  } catch (e) {
    console.error('갤러리 파일 삭제 처리 오류:', e);
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
  const { id, title, contentSort, content } = req.body;
  try {
    const query = `
      UPDATE practice SET
        title = ?,
        contentSort = ?,
        content = ?
      WHERE id = ?
    `;
    const params = [title, contentSort, content, id];
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




// 게시글 사진 파일 저장 미들웨어
const storage = multer.diskStorage({
  destination(req, file, done) { 
    done(null, 'build/images/notice');
  }, 
  filename(req, file, done) {
    done(null, file.originalname);
  }
});

const upload_default = multer({ storage });

// 이미지 업로드 미들웨어를 조건부로 실행 (현재 사용하지 않음)
const conditionalUpload = (req, res, next) => {
  if (req.query.postImage) {
    upload_default.array('img')(req, res, next);
  } else {
    next();
  }
};

// 개별 서비스 항목 업데이트
router.post('/updateserviceitem', conditionalUpload, async (req, res) => {
  const { id, title, content, image, index, action } = req.body;
  const indexNum = Number(index);
  
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
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < mainServiceList.length) {
            mainServiceList.splice(indexNum, 1);
          }
        } else {
          // 업데이트 또는 추가 액션
          const normalizedContent = Array.isArray(content)
            ? content
            : (typeof content === 'string'
                ? (() => { try { const p = JSON.parse(content); return Array.isArray(p) ? p : []; } catch { return []; } })()
                : []);

          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < mainServiceList.length) {
            // 기존 항목 업데이트
            mainServiceList[indexNum] = {
              title: title || '',
              content: normalizedContent,
              image: image || ''
            };
          } else {
            // 새 항목 추가
            mainServiceList.push({
              title: title || '',
              content: normalizedContent,
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



// 개별 시설 항목 업데이트
router.post('/updatefacilityitem', conditionalUpload, async (req, res) => {
  const { id, title, image, index, action } = req.body;
  const indexNum = Number(index);

  try {
    const getQuery = `SELECT facility FROM mainInfo WHERE id = ?`;
    db.query(getQuery, [id], function (error, result) {
      if (error) {
        console.error('시설 데이터 조회 오류:', error);
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
        const facilityList = JSON.parse(result[0].facility || '[]');

        if (action === 'delete') {
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < facilityList.length) {
            facilityList.splice(indexNum, 1);
          }
        } else {
          if (!Number.isNaN(indexNum) && indexNum >= 0 && indexNum < facilityList.length) {
            facilityList[indexNum] = {
              title: title || '',
              image: image || ''
            };
          } else {
            facilityList.push({
              title: title || '',
              image: image || ''
            });
          }
        }

        const updateQuery = `UPDATE mainInfo SET facility = ? WHERE id = ?`;
        const updatedFacility = JSON.stringify(facilityList);
        db.query(updateQuery, [updatedFacility, id], function (updateError, updateResult) {
          if (updateError) {
            console.error('시설 항목 업데이트 오류:', updateError);
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
    console.error('시설 항목 업데이트 오류:', error);
    res.send(false);
    res.end();
  }
});




// 메인 데이터
router.get('/getrehabilitate', async (req, res) => {
  var { id } = req.body;
  const query = `
    SELECT * FROM rehabilitate;
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



module.exports = router;
