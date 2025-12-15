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

interface GalleryItem {
  id: number;
  image: string;
  subtitle: string;
  date: string;
}

export default function EditGallery() {
  const navigate = useNavigate();
  const isLogin = useRecoilValue(recoilLoginState);
  const [currentTab, setCurrentTab] = useState<'program' | 'support'>('program');
  const [images, setImages] = useState<GalleryItem[]>([]);
  // 개별 이미지 수정 상태
  const [editingImageIndex, setEditingImageIndex] = useState<number>(-1);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [itemImageFiles, setItemImageFiles] = useState<{ [key: number]: File[] }>({});
  
  // 이미지 첨부 관련 상태
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // 이미지 첨부 함수
  const currentDate = new Date();
  const date = format(currentDate, 'yyyy-MM-dd');
  
  // 임의의 영문+숫자 문자열 생성 함수
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 이미지 압축 및 파일명 생성 함수
  const processImageFiles = async (acceptedFiles: File[]) => {
    try {
      // 허용 확장자 필터
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const validFiles = acceptedFiles.filter(f => allowedTypes.includes(f.type));
      if (validFiles.length === 0) {
        alert('jpg, jpeg, png 형식의 이미지 파일만 업로드할 수 있습니다.');
        return [];
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1000
      };
      const resizedFiles = await Promise.all(
        validFiles.map(async (file) => {
          setImageLoading(true);
          const resizingBlob = await imageCompression(file, options);
          return resizingBlob;
        })
      );
      
      const adminId = 'admin'; // 관리자 ID
      const fileCopies = resizedFiles.map((resizedFile, index) => {
        const randomString = generateRandomString(10);
        // 확장자는 MIME 타입으로 결정하고, 원본 파일명은 사용하지 않음
        const originalFile = validFiles[index];
        const mime = originalFile.type || '';
        const extension = mime.includes('png')
          ? '.png'
          : mime.includes('jpeg') || mime.includes('jpg')
            ? '.jpg'
            : mime.includes('gif')
              ? '.gif'
              : '.jpg';
        
        return new File([resizedFile], `${date}${adminId}_${randomString}${extension}`, {
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

  // 개별 항목용 드롭존
  const itemDropzone = useDropzone({
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      const processedFiles = await processImageFiles(acceptedFiles);
      const targetIndex = currentImageIndex >= 0 ? currentImageIndex : 0;
      setItemImageFiles(prev => ({ ...prev, [targetIndex]: processedFiles }));
      setCurrentImageIndex(-1);
    }, [currentImageIndex])
  });
  
  // 첨부 이미지 삭제 함수
  const deleteImage = (idx: number) => {
    const copy = [...imageFiles];
    const newItems = copy.filter((item, i) => i !== idx);
    setImageFiles(newItems);
  };

  const load = async () => {
    try {
      const endpoint = currentTab === 'program' 
        ? `${MainURL}/main/getgalleryprogram`
        : `${MainURL}/main/getgallerysupport`;
      const res = await axios.get(endpoint);
      if (res.data && Array.isArray(res.data)) {
        setImages(res.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('갤러리 데이터 로드 오류:', error);
      setImages([]);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      navigate('/admin');
      return;
    }
    load();
  }, [currentTab]);

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

  const onReplaceImage = async (file: File): Promise<string | null> => {
    // 갤러리 업로드와 동일 경로 사용
    return onAddImage(file);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setImages(copy);
    // 순서 변경은 클라이언트에서만 표시하고, 실제 저장은 각 항목 수정 시 반영됨
  };

  const startEditImage = (idx: number) => {
    setEditingImageIndex(idx);
    setEditingImage({ ...images[idx] });
    setItemImageFiles({ [idx]: [] });
  };

  const cancelEditImage = () => {
    setEditingImageIndex(-1);
    setEditingImage(null);
    setItemImageFiles({});
  };

  const saveImageItem = async (idx: number) => {
    if (editingImage == null || !images[idx]) return;
    try {
      let imageFilename = editingImage.image;
      if (itemImageFiles[idx] && itemImageFiles[idx].length > 0) {
        const uploaded = await onReplaceImage(itemImageFiles[idx][0]);
        if (uploaded) imageFilename = uploaded;
      }

      const endpoint = currentTab === 'program'
        ? `${MainURL}/main/galleryprogram/update`
        : `${MainURL}/main/gallerysupport/update`;

      const payload = {
        id: images[idx].id,
        image: imageFilename,
        subtitle: editingImage.subtitle || '',
        date: editingImage.date || ''
      };
      const res = await axios.post(endpoint, payload);
      if (res.data === true) {
        const updated = images.map((it, i) => 
          i === idx 
            ? { ...it, image: imageFilename, subtitle: editingImage.subtitle || '', date: editingImage.date || '' }
            : it
        );
        setImages(updated);
        setEditingImageIndex(-1);
        setEditingImage(null);
        setItemImageFiles({});
        alert('이미지 항목이 저장되었습니다.');
        load(); // 목록 새로고침
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (e) {
      console.error('갤러리 항목 저장 오류:', e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const deleteImageItem = async (idx: number) => {
    if (!images[idx] || !window.confirm('이 이미지를 삭제하시겠습니까?')) return;
    try {
      const endpoint = currentTab === 'program'
        ? `${MainURL}/main/galleryprogram/delete`
        : `${MainURL}/main/gallerysupport/delete`;

      const res = await axios.post(endpoint, { id: images[idx].id });
      if (res.data === true) {
        const copy = images.filter((_, i) => i !== idx);
        setImages(copy);
        alert('이미지가 삭제되었습니다.');
        load(); // 목록 새로고침
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (e) {
      console.error('갤러리 항목 삭제 오류:', e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="AdminContent adminEditMainInfo">
      <div className="adminEditCard">
        <h3 style={{ marginBottom: 12, textAlign: 'center' }}>갤러리 수정</h3>
        <div className='adminTabs'>
          <div 
            className={`adminTab ${currentTab === 'program' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('program')}
          >
            프로그램
          </div>
          <div 
            className={`adminTab ${currentTab === 'support' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('support')}
          >
            후원물품
          </div>
        </div>
        <div>
          <h4 style={{marginBottom: '15px'}}>
            {currentTab === 'program' ? '프로그램' : '후원물품'} 갤러리
          </h4>
              {images.map((img, idx) => (
                <div key={img.id || idx} className="adminRepeatCard" style={{ 
                  border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fafafa'
                }}>
                  {/* 표시 영역 */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr', gap: 8, alignItems:'center', flex:1 }}>
                      {img.image ? (
                        <img src={`${MainURL}/images/gallery/${img.image}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 120, height: 80, borderRadius: 6, border: '1px dashed #cbd5e1', background: '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:12 }}>
                          이미지 없음
                        </div>
                      )}
                      <div style={{ color:'#666', fontSize: 14 }}>{img.subtitle || ''}</div>
                      <div style={{ color:'#666', fontSize: 14 }}>{img.date || ''}</div>
                    </div>
                    <div style={{ display:'flex', gap:8, marginLeft: 12, alignItems:'center' }}>
                      <div 
                        className='adminBtn'
                        style={{ padding:'4px 8px', fontSize:12, borderRadius:4 }}
                        onClick={() => moveImage(idx, idx - 1)}
                      >⬆️ 위로</div>
                      <div 
                        className='adminBtn'
                        style={{ padding:'4px 8px', fontSize:12, borderRadius:4 }}
                        onClick={() => moveImage(idx, idx + 1)}
                      >⬇️ 아래로</div>
                      <div className='adminBtn' style={{ backgroundColor:'#2196F3', color:'#fff', padding:'6px 12px', fontSize:12, borderRadius:4 }} onClick={()=>startEditImage(idx)}>✏️ 수정</div>
                      <div className='adminBtn danger' style={{ padding:'6px 12px', fontSize:12, borderRadius:4 }} onClick={() => deleteImageItem(idx)}>🗑️ 삭제</div>
                    </div>
                  </div>

                  {/* 수정 모드 */}
                  {editingImageIndex === idx && editingImage && (
                    <div style={{ border:'2px solid #2196F3', borderRadius:8, padding:12, backgroundColor:'#f8f9ff' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:8, alignItems:'center', marginBottom: 12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {editingImage.image ? (
                          <img src={`${MainURL}/images/gallery/${editingImage.image}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 120, height: 80, borderRadius: 6, border: '1px dashed #cbd5e1', background: '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:12 }}>
                            이미지 없음
                          </div>
                        )}
                        {editingImage.image && (
                          <div 
                            className='adminBtn danger'
                            style={{ fontSize:10, padding:'4px 8px', display:'inline-flex', width:'auto' }}
                            onClick={async () => {
                              if (window.confirm('이미지 파일을 삭제하시겠습니까?')) {
                                setEditingImage({ ...editingImage, image: '' });
                                alert('이미지가 제거되었습니다. 저장하면 반영됩니다.');
                              }
                            }}
                          >
                            기존 이미지 제거
                          </div>
                        )}
                      </div>
                      <input placeholder='부제목' className='inputdefault' value={editingImage.subtitle || ''} onChange={(e)=> setEditingImage({ ...editingImage, subtitle: e.target.value })} />
                      <input placeholder='날짜' className='inputdefault' value={editingImage.date || ''} onChange={(e)=> setEditingImage({ ...editingImage, date: e.target.value })} />
                    </div>

                      <div className="imageInputBox" style={{ position:'relative' }}>
                        {imageLoading ? (
                          <div style={{width:'100%', height:'100%', position:'absolute'}}>
                            <Loading/>
                          </div>
                        ) : (
                          <div className='imageDropzoneCover'>
                            <div className="imageDropzoneStyle" onClick={() => setCurrentImageIndex(idx)}>
                              <div {...itemDropzone.getRootProps()}>
                                <input {...itemDropzone.getInputProps()} />
                                {(itemImageFiles[idx] || []).length > 0 
                                  ? <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', display:'inline-flex', width:'auto'}}>+ 다시첨부하기</div>
                                  : <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', display:'inline-flex', width:'auto'}}>+ 이미지첨부하기</div>
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        {(itemImageFiles[idx] || []).length > 0 && itemImageFiles[idx].map((file: File, fIdx: number) => (
                          <div key={fIdx} className='imagebox'>
                            <img src={URL.createObjectURL(file)} style={{width:200, height:'auto', objectFit:'cover', borderRadius:6}} />
                            <p>{file.name}</p>
                            <div onClick={() => {
                              setItemImageFiles(prev => {
                                const current = prev[idx] || [];
                                const filtered = current.filter((_, i) => i !== fIdx);
                                return { ...prev, [idx]: filtered };
                              });
                            }}>
                              <CiCircleMinus color='#FF0000' size={20} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop: 12 }}>
                        <div className='adminBtn' style={{ backgroundColor:'#f5f5f5', color:'#666', padding:'8px 16px', fontSize:12 }} onClick={cancelEditImage}>❌ 취소</div>
                        <div className='adminBtn' style={{ backgroundColor:'#4CAF50', color:'#fff', padding:'8px 16px', fontSize:12 }} onClick={() => saveImageItem(idx)}>💾 저장</div>
                      </div>
                    </div>
                  )}
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
                          ? <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', display:'inline-flex', width:'auto'}}>+ 다시첨부하기</div>
                          : <div className='imageplus' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', display:'inline-flex', width:'auto'}}>+ 이미지첨부하기</div>
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
                      const endpoint = currentTab === 'program'
                        ? `${MainURL}/main/galleryprogram/add`
                        : `${MainURL}/main/gallerysupport/add`;
                      
                      const res = await axios.post(endpoint, {
                        image: filename,
                        subtitle: '',
                        date: ''
                      });
                      
                      if (res.data && res.data.success) {
                        setImageFiles([]);
                        alert('이미지가 추가되었습니다.');
                        load(); // 목록 새로고침
                      } else {
                        alert('이미지 추가에 실패했습니다.');
                      }
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
              </div>
        </div>
      </div>
    </div>
  );
}


