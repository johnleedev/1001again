import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import MainURL from '../../MainURL';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilLoginState } from '../../RecoilStore';
import { useDropzone } from 'react-dropzone';
import imageCompression from "browser-image-compression";
import { format } from "date-fns";
import { CiCircleMinus } from "react-icons/ci";
import Loading from '../../components/Loading';

interface GalleryRow {
  id: number;
  title: string;
  date: string;
  images: string; // JSON string
}

export default function EditGallery() {
  const navigate = useNavigate();
  const isLogin = useRecoilValue(recoilLoginState);
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [selected, setSelected] = useState<GalleryRow | null>(null);
  const [images, setImages] = useState<any[]>([]);
  
  // 이미지 첨부 관련 상태
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // 이미지 첨부 함수
  const currentDate = new Date();
  const date = format(currentDate, 'yyyy-MM-dd');
  
  // 이미지 압축 및 파일명 생성 함수
  const processImageFiles = async (acceptedFiles: File[]) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1000
      };
      const resizedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          setImageLoading(true);
          const resizingBlob = await imageCompression(file, options);
          return resizingBlob;
        })
      );
      
      const regexCopy = /[^a-zA-Z0-9!@#$%^&*()\-_=+\[\]{}|;:'",.<>]/g;
      const adminId = 'admin'; // 관리자 ID
      const fileCopies = resizedFiles.map((resizedFile, index) => {
        const regex = resizedFile.name.replace(regexCopy, '');
        const regexSlice = regex.slice(-15);
        return new File([resizedFile], `${date}${adminId}_${regexSlice}`, {
          type: acceptedFiles[index].type,
        });
      });
      setImageLoading(false);
      return fileCopies;
    } catch (error) {
      console.error('이미지 리사이징 중 오류 발생:', error);
      setImageLoading(false);
      return [];
    }
  };
  
  // 드롭존 설정
  const imageDropzone = useDropzone({ 
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      const processedFiles = await processImageFiles(acceptedFiles);
      setImageFiles(processedFiles);
    }, []) 
  });
  
  // 첨부 이미지 삭제 함수
  const deleteImage = (idx: number) => {
    const copy = [...imageFiles];
    const newItems = copy.filter((item, i) => i !== idx);
    setImageFiles(newItems);
  };

  const load = async () => {
    const res = await axios.get(`${MainURL}/main/getgallery`);
    if (res.data) {
      setRows(res.data);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      navigate('/admin');
      return;
    }
    load();
  }, []);

  const selectRow = (row: GalleryRow) => {
    setSelected(row);
    try {
      setImages(JSON.parse(row.images || '[]'));
    } catch {
      setImages([]);
    }
  };

  const onAddImage = async (file: File): Promise<string | null> => {
    try {
      console.log('이미지 업로드 시작:', file.name, file.size, file.type);
      const form = new FormData();
      form.append('img', file);
      
      console.log('FormData 생성됨, 업로드 URL:', `${MainURL}/main/upload/gallery`);
      
      const res = await axios.post(`${MainURL}/main/upload/gallery`, form, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      console.log('서버 응답:', res.data);
      
      if (res.data && res.data.filenames && res.data.filenames.length > 0) {
        const filename = res.data.filenames[0];
        console.log('업로드 성공, 파일명:', filename);
        return filename;
      } else {
        console.error('서버 응답에 filename이 없음:', res.data);
        return null;
      }
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      if (error.response) {
        console.error('서버 응답 오류:', error.response.data);
        console.error('HTTP 상태:', error.response.status);
      }
      return null;
    }
  };

  const updateImageField = (index: number, key: string, value: string) => {
    const copy = images.map((it, i) => i === index ? { ...it, [key]: value } : it);
    setImages(copy);
  };

  const save = async () => {
    if (!selected) return;
    const payload = { id: selected.id, images: JSON.stringify(images) };
    const res = await axios.post(`${MainURL}/main/gallery/update`, payload);
    if (res.data === true) {
      alert('저장되었습니다.');
      navigate('/admin/main');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="AdminContent adminEditMainInfo">
      <div className="adminEditCard">
        <h3 style={{ marginBottom: 12, textAlign: 'center' }}>갤러리 수정</h3>
        <div>
          <div style={{ marginBottom: 24 }}>
            <h4>갤러리 목록</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rows.map((r) => (
                <div key={r.id} className='amdin_Main_Box' onClick={()=>selectRow(r)} style={{ marginBottom: 8, minWidth: '120px', textAlign: 'center' }}>
                  {r.title} (id: {r.id})
                </div>
              ))}
            </div>
          </div>
          
          {selected ? (
            <div>
              <h4>선택됨: {selected.title}</h4>
              {images.map((img, idx) => (
                <div key={idx} className="adminRepeatCard" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 60px', gap: 8, alignItems: 'center' }}>
                  <img src={`${MainURL}/images/gallery/${img.image}`} style={{ width: 120, height: 80, objectFit: 'cover' }} />
                  <input placeholder='부제목' className='inputdefault' value={img.subtitle || ''} onChange={(e)=>updateImageField(idx, 'subtitle', e.target.value)} />
                  <input placeholder='날짜' className='inputdefault' value={img.date || ''} onChange={(e)=>updateImageField(idx, 'date', e.target.value)} />
                  <div onClick={() => {
                    if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
                      const copy = images.filter((_, i) => i !== idx);
                      setImages(copy);
                    }
                  }}>
                    <CiCircleMinus color='#FF0000' size={20} />
                  </div>
                </div>
              ))}
              <div className="adminField" style={{ alignItems: 'stretch' }}>
                <div className="imageInputBox">
                  {imageLoading ? (
                    <div style={{width:'100%', height:'100%', position:'absolute'}}>
                      <Loading/>
                    </div>
                  ) : (
                    <div className='imageDropzoneCover'>
                      <div {...imageDropzone.getRootProps()} className="imageDropzoneStyle">
                        <input {...imageDropzone.getInputProps()} />
                        {imageFiles.length > 0 
                          ? <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px'}}>+ 다시첨부하기</div>
                          : <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px'}}>+ 이미지첨부하기</div>
                        }
                      </div>
                    </div>
                  )}
                  
                  {imageFiles.length > 0 && imageFiles.map((item: File, index: number) => (
                    <div key={index} className='imagebox'>
                      <img 
                        src={URL.createObjectURL(item)}
                        style={{width:'200px', height:'auto', objectFit:'cover', borderRadius:6}}
                      />
                      <p>{item.name}</p>
                      <div onClick={() => deleteImage(index)}>
                        <CiCircleMinus color='#FF0000' size={20} />
                      </div>
                    </div>
                  ))}
                </div>
                
                {imageFiles.length > 0 && (
                  <div className='adminBtn' style={{ marginTop: 8 }} onClick={async () => {
                    if (imageFiles.length === 0) return;
                    const filename = await onAddImage(imageFiles[0]);
                    if (filename) {
                      const copy = [...images, { image: filename, subtitle: '', date: '' }];
                      setImages(copy);
                      setImageFiles([]);
                      alert('이미지가 추가되었습니다.');
                    } else {
                      alert('이미지 업로드에 실패했습니다.');
                    }
                  }}>
                    이미지 추가하기
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <div className='btn-row' onClick={()=>navigate('/admin/main')}><p>취소</p></div>
                <div className='btn-row' onClick={save}><p>저장</p></div>
              </div>
            </div>
          ) : (
            <div>위에서 항목을 선택하세요.</div>
          )}
        </div>
      </div>
    </div>
  );
}


