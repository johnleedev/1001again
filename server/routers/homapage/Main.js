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
const uploadGallery = multer({ 
  storage: galleryStorage,
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || '';
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(mime)) {
      cb(null, true);
    } else {
      console.warn('갤러리 업로드 거부 - 허용되지 않은 MIME 타입:', mime, '파일명:', file.originalname);
      cb(new Error('INVALID_FILE_TYPE'));
    }
  }
});
const uploadMainImage = multer({ storage: mainImageStorage });

// 갤러리 업로드 전용 미들웨어 (galleryImage 쿼리로 업로드 허용)
const conditionalGalleryUpload = (req, res, next) => {
  if (req.query.galleryImage) {
    uploadGallery.array('img')(req, res, next);
  } else {
    next();
  }
};

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

router.post('/upload/gallery', (req, res) => {
  uploadGallery.array('img')(req, res, (err) => {
    if (err) {
      console.error('갤러리 이미지 업로드 오류:', err.message || err);
      res.status(400).json({ success: false, message: 'jpg, jpeg, png 파일만 업로드 가능합니다.' });
      return;
    }
    if (!req.files || req.files.length === 0) {
      res.send(false);
      return res.end();
    }
    try {
      const filenames = req.files.map(f => {
        const filename = f.originalname;
        console.log('갤러리 이미지 업로드 - 원본 파일명:', filename);
        // 확장자 확인
        if (!filename.includes('.')) {
          console.warn('경고: 파일명에 확장자가 없습니다:', filename);
        }
        return filename;
      });
      res.json({ filenames });
      res.end();
    } catch (error) {
      console.error('갤러리 이미지 업로드 오류:', error);
      res.send(false);
      res.end();
    }
  });
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

// 메인 서비스 이미지 전체 저장
router.post('/main/mainserviceimage/save', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, message: 'items 배열이 필요합니다.' });
    return;
  }
  try {
    await new Promise((resolve) => db.query(`DELETE FROM mainServiceImage`, () => resolve()));

    let success = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      const title = escapeQuotes(it.title || '');
      const image = escapeQuotes(it.image || '');
      const content = escapeQuotes(JSON.stringify(it.content || []));
      const q = `INSERT INTO mainServiceImage (title, image, content) VALUES ('${title}', '${image}', '${content}')`;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        db.query(q, function(err) {
          if (err) {
            console.error('mainServiceImage INSERT 오류:', err);
            errors.push({ index: i, error: err.message });
          } else {
            success++;
          }
          resolve();
        });
      });
    }
    res.json({ success: true, successCount: success, totalCount: items.length, errors: errors.length ? errors : undefined });
  } catch (e) {
    console.error('mainServiceImage 저장 오류:', e);
    res.status(500).json({ success: false, message: '저장 중 오류가 발생했습니다.', error: e.message });
  }
});

// 메인 시설 이미지 전체 저장
router.post('/main/mainfacilityimage/save', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, message: 'items 배열이 필요합니다.' });
    return;
  }
  try {
    await new Promise((resolve) => db.query(`DELETE FROM mainFacilityImage`, () => resolve()));

    let success = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      const title = escapeQuotes(it.title || '');
      const image = escapeQuotes(it.image || '');
      const q = `INSERT INTO mainFacilityImage (title, image) VALUES ('${title}', '${image}')`;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        db.query(q, function(err) {
          if (err) {
            console.error('mainFacilityImage INSERT 오류:', err);
            errors.push({ index: i, error: err.message });
          } else {
            success++;
          }
          resolve();
        });
      });
    }
    res.json({ success: true, successCount: success, totalCount: items.length, errors: errors.length ? errors : undefined });
  } catch (e) {
    console.error('mainFacilityImage 저장 오류:', e);
    res.status(500).json({ success: false, message: '저장 중 오류가 발생했습니다.', error: e.message });
  }
});


// 프로그램 갤러리 (galleryProgram 테이블)
router.get('/getgalleryprogram', async (req, res) => {
  const query = `
    SELECT * FROM galleryProgram ORDER BY date DESC, id DESC;
  `;
  db.query(query, function (error, result) {
    if (error) {
      console.error('프로그램 갤러리 조회 오류:', error);
      res.send(false);
      res.end();
      return;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
    res.end();
  });
});

// 메인 서비스 이미지 (mainServiceImage 테이블)
router.get('/getmainserviceimage', async (req, res) => {
  const query = `
    SELECT * FROM mainServiceImage;
  `;
  db.query(query, function (error, result) {
    if (error) {
      console.error('mainServiceImage 조회 오류:', error);
      res.send(false);
      res.end();
      return;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
    res.end();
  });
});

// 시설 이미지 (mainFacilityImage 테이블)
router.get('/getmainfacilityimage', async (req, res) => {
  const query = `
    SELECT * FROM mainFacilityImage;
  `;
  db.query(query, function (error, result) {
    if (error) {
      console.error('mainFacilityImage 조회 오류:', error);
      res.send(false);
      res.end();
      return;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
    res.end();
  });
});

// 후원물품 갤러리 (gallerySupport 테이블)
router.get('/getgallerysupport', async (req, res) => {
  const query = `
    SELECT * FROM gallerySupport ORDER BY date DESC, id DESC;
  `;
  db.query(query, function (error, result) {
    if (error) {
      console.error('후원물품 갤러리 조회 오류:', error);
      res.send(false);
      res.end();
      return;
    }
    if (result.length > 0) {
      res.json(result);
    } else {
      res.json([]);
    }
    res.end();
  });
});

// 프로그램 갤러리 항목 추가
router.post('/galleryprogram/add', conditionalGalleryUpload, async (req, res) => {
  const { image, subtitle, date } = req.body;
  try {
    const imageEscaped = escapeQuotes(image || '');
    const subtitleEscaped = escapeQuotes(subtitle || '');
    const dateEscaped = escapeQuotes(date || '');
    
    const query = `INSERT INTO galleryProgram (image, subtitle, date) VALUES (?, ?, ?)`;
    db.query(query, [imageEscaped, subtitleEscaped, dateEscaped], function (error, result) {
      if (error) {
        console.error('프로그램 갤러리 추가 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.insertId) {
        res.json({ success: true, id: result.insertId });
      } else {
        res.send(false);
      }
      res.end();
    });
  } catch (error) {
    console.error('프로그램 갤러리 추가 오류:', error);
    res.send(false);
    res.end();
  }
});

// 프로그램 갤러리 항목 수정
router.post('/galleryprogram/update', conditionalGalleryUpload, async (req, res) => {
  const { id, image, subtitle, date } = req.body;
  try {
    const imageEscaped = escapeQuotes(image || '');
    const subtitleEscaped = escapeQuotes(subtitle || '');
    const dateEscaped = escapeQuotes(date || '');
    
    const query = `UPDATE galleryProgram SET image = ?, subtitle = ?, date = ? WHERE id = ?`;
    db.query(query, [imageEscaped, subtitleEscaped, dateEscaped, id], function (error, result) {
      if (error) {
        console.error('프로그램 갤러리 수정 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.affectedRows > 0) {
        res.send(true);
      } else {
        res.send(false);
      }
      res.end();
    });
  } catch (error) {
    console.error('프로그램 갤러리 수정 오류:', error);
    res.send(false);
    res.end();
  }
});

// 프로그램 갤러리 항목 삭제
router.post('/galleryprogram/delete', async (req, res) => {
  const { id } = req.body;
  try {
    // 먼저 이미지 파일명 가져오기
    const getQuery = `SELECT image FROM galleryProgram WHERE id = ?`;
    db.query(getQuery, [id], function (error, result) {
      if (error) {
        console.error('프로그램 갤러리 조회 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.length > 0 && result[0].image) {
        const filePath = `./build/images/gallery/${result[0].image}`;
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('프로그램 갤러리 파일 삭제 오류:', err);
          });
        }
      }
      
      const deleteQuery = `DELETE FROM galleryProgram WHERE id = ?`;
      db.query(deleteQuery, [id], function (deleteError, deleteResult) {
        if (deleteError) {
          console.error('프로그램 갤러리 삭제 오류:', deleteError);
          res.send(false);
          res.end();
          return;
        }
        if (deleteResult.affectedRows > 0) {
          res.send(true);
        } else {
          res.send(false);
        }
        res.end();
      });
    });
  } catch (error) {
    console.error('프로그램 갤러리 삭제 오류:', error);
    res.send(false);
    res.end();
  }
});

// 후원물품 갤러리 항목 추가
router.post('/gallerysupport/add', conditionalGalleryUpload, async (req, res) => {
  const { image, subtitle, date } = req.body;
  try {
    const imageEscaped = escapeQuotes(image || '');
    const subtitleEscaped = escapeQuotes(subtitle || '');
    const dateEscaped = escapeQuotes(date || '');
    
    const query = `INSERT INTO gallerySupport (image, subtitle, date) VALUES (?, ?, ?)`;
    db.query(query, [imageEscaped, subtitleEscaped, dateEscaped], function (error, result) {
      if (error) {
        console.error('후원물품 갤러리 추가 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.insertId) {
        res.json({ success: true, id: result.insertId });
      } else {
        res.send(false);
      }
      res.end();
    });
  } catch (error) {
    console.error('후원물품 갤러리 추가 오류:', error);
    res.send(false);
    res.end();
  }
});

// 후원물품 갤러리 항목 수정
router.post('/gallerysupport/update', conditionalGalleryUpload, async (req, res) => {
  const { id, image, subtitle, date } = req.body;
  try {
    const imageEscaped = escapeQuotes(image || '');
    const subtitleEscaped = escapeQuotes(subtitle || '');
    const dateEscaped = escapeQuotes(date || '');
    
    const query = `UPDATE gallerySupport SET image = ?, subtitle = ?, date = ? WHERE id = ?`;
    db.query(query, [imageEscaped, subtitleEscaped, dateEscaped, id], function (error, result) {
      if (error) {
        console.error('후원물품 갤러리 수정 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.affectedRows > 0) {
        res.send(true);
      } else {
        res.send(false);
      }
      res.end();
    });
  } catch (error) {
    console.error('후원물품 갤러리 수정 오류:', error);
    res.send(false);
    res.end();
  }
});

// 후원물품 갤러리 항목 삭제
router.post('/gallerysupport/delete', async (req, res) => {
  const { id } = req.body;
  try {
    // 먼저 이미지 파일명 가져오기
    const getQuery = `SELECT image FROM gallerySupport WHERE id = ?`;
    db.query(getQuery, [id], function (error, result) {
      if (error) {
        console.error('후원물품 갤러리 조회 오류:', error);
        res.send(false);
        res.end();
        return;
      }
      if (result.length > 0 && result[0].image) {
        const filePath = `./build/images/gallery/${result[0].image}`;
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('후원물품 갤러리 파일 삭제 오류:', err);
          });
        }
      }
      
      const deleteQuery = `DELETE FROM gallerySupport WHERE id = ?`;
      db.query(deleteQuery, [id], function (deleteError, deleteResult) {
        if (deleteError) {
          console.error('후원물품 갤러리 삭제 오류:', deleteError);
          res.send(false);
          res.end();
          return;
        }
        if (deleteResult.affectedRows > 0) {
          res.send(true);
        } else {
          res.send(false);
        }
        res.end();
      });
    });
  } catch (error) {
    console.error('후원물품 갤러리 삭제 오류:', error);
    res.send(false);
    res.end();
  }
});


// (삭제됨) gallery 테이블 관련 라우트 제거

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
