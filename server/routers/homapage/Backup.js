const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
const { db } = require('../common/db');
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const multer  = require('multer');


const escapeQuotes = (str) => str.replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\t', '\\\\t')
                              .replaceAll('\\n', '\\\\n').replaceAll('è', '\è').replaceAll('é', '\é');


// 리스트 가져오기
router.get('/getdatas', async (req, res) => {
 
  try {
    db.query(`
      SELECT * FROM mainInfo;
      `, async function(error, result){
      if (error) {throw error}
      if (result.length > 0) {
        res.json(result);
        res.end();
      } else {
        res.send(false);
        res.end();
      }
    });
  } catch (error) {
    console.error(error);
    res.send(false);
    res.end();
  }
});



// gallery 데이터를 galleryProgram 또는 gallerySupport 테이블에 저장
router.post('/savegallerydata', async (req, res) => {
  const { id, title, images } = req.body;

  if (!id) {
    res.status(400).json({ success: false, message: 'ID가 필요합니다.' });
    res.end();
    return;
  }

  if (!title) {
    res.status(400).json({ success: false, message: 'title이 필요합니다.' });
    res.end();
    return;
  }

  if (!images || !Array.isArray(images)) {
    res.status(400).json({ success: false, message: 'images 배열이 필요합니다.' });
    res.end();
    return;
  }

  try {
    // title에 따라 테이블 결정
    let tableName = '';
    if (title === '프로그램') {
      tableName = 'galleryProgram';
    } else if (title === '후원물품') {
      tableName = 'gallerySupport';
    } else {
      res.status(400).json({ success: false, message: '알 수 없는 title입니다.' });
      res.end();
      return;
    }

    // 기존 데이터 삭제 (선택사항 - 필요시 주석 해제)
    // db.query(`DELETE FROM ${tableName}`, function(error) {
    //   if (error) {
    //     console.error(`기존 데이터 삭제 오류:`, error);
    //   }
    // });

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // 각 이미지 항목을 테이블에 저장
    for (let i = 0; i < images.length; i++) {
      const imageItem = images[i];
      const image = imageItem.image || '';
      const subtitle = imageItem.subtitle || '';
      const date = imageItem.date || '';

      // 각 필드를 이스케이프 처리
      const imageEscaped = escapeQuotes(image);
      const subtitleEscaped = escapeQuotes(subtitle);
      const dateEscaped = escapeQuotes(date);

      const insertQuery = `
        INSERT INTO ${tableName} (image, subtitle, date)
        VALUES ('${imageEscaped}', '${subtitleEscaped}', '${dateEscaped}');
      `;

      await new Promise((resolve, reject) => {
        db.query(insertQuery, function(error, result) {
          if (error) {
            console.error(`${tableName} INSERT 오류:`, error);
            console.error('SQL 쿼리:', insertQuery);
            failCount++;
            errors.push({ index: i, error: error.message });
            resolve();
          } else {
            successCount++;
            resolve();
          }
        });
      });
    }

    res.json({ 
      success: true, 
      message: `${tableName} 테이블에 저장 완료`,
      successCount: successCount,
      failCount: failCount,
      totalCount: images.length,
      errors: errors.length > 0 ? errors : undefined
    });
    res.end();
  } catch (error) {
    console.error('gallery 데이터 저장 오류:', error);
    res.status(500).json({ success: false, message: '저장 중 오류가 발생했습니다.', error: error.message });
    res.end();
  }
});


// mainService / facility 데이터를 별도 테이블에 저장
router.post('/savemainimages', async (req, res) => {
  const { mainService, facility } = req.body;

  if (!Array.isArray(mainService) || !Array.isArray(facility)) {
    res.status(400).json({ success: false, message: 'mainService와 facility는 배열이어야 합니다.' });
    res.end();
    return;
  }

  try {
    // 기존 데이터 삭제
    await new Promise((resolve) => {
      db.query(`DELETE FROM mainServiceImage`, () => resolve());
    });
    await new Promise((resolve) => {
      db.query(`DELETE FROM mainFacilityImage`, () => resolve());
    });

    let serviceSuccess = 0;
    let facilitySuccess = 0;
    const serviceErrors = [];
    const facilityErrors = [];

    // mainServiceImage 삽입: title, image, content(JSON 문자열)
    for (let i = 0; i < mainService.length; i++) {
      const item = mainService[i] || {};
      const title = escapeQuotes(item.title || '');
      const image = escapeQuotes(item.image || '');
      const contentStr = escapeQuotes(JSON.stringify(item.content || []));

      const insertQuery = `
        INSERT INTO mainServiceImage (title, image, content)
        VALUES ('${title}', '${image}', '${contentStr}');
      `;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        db.query(insertQuery, function(error) {
          if (error) {
            console.error('mainServiceImage INSERT 오류:', error);
            console.error('SQL 쿼리:', insertQuery);
            serviceErrors.push({ index: i, error: error.message });
          } else {
            serviceSuccess++;
          }
          resolve();
        });
      });
    }

    // mainFacilityImage 삽입: title, image
    for (let i = 0; i < facility.length; i++) {
      const item = facility[i] || {};
      const title = escapeQuotes(item.title || '');
      const image = escapeQuotes(item.image || '');

      const insertQuery = `
        INSERT INTO mainFacilityImage (title, image)
        VALUES ('${title}', '${image}');
      `;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        db.query(insertQuery, function(error) {
          if (error) {
            console.error('mainFacilityImage INSERT 오류:', error);
            console.error('SQL 쿼리:', insertQuery);
            facilityErrors.push({ index: i, error: error.message });
          } else {
            facilitySuccess++;
          }
          resolve();
        });
      });
    }

    res.json({
      success: true,
      service: { successCount: serviceSuccess, totalCount: mainService.length, errors: serviceErrors.length ? serviceErrors : undefined },
      facility: { successCount: facilitySuccess, totalCount: facility.length, errors: facilityErrors.length ? facilityErrors : undefined }
    });
    res.end();
  } catch (error) {
    console.error('mainService/facility 저장 오류:', error);
    res.status(500).json({ success: false, message: '저장 중 오류가 발생했습니다.', error: error.message });
    res.end();
  }
});



module.exports = router;
