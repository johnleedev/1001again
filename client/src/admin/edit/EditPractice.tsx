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

interface PracticeRow {
  id: number;
  title: string;
  date: string;
  content: string; // JSON or string by contentSort
  contentSort: 'text' | 'onlyimage';
}

export default function EditPractice() {
  const navigate = useNavigate();
  const isLogin = useRecoilValue(recoilLoginState);
  const [rows, setRows] = useState<PracticeRow[]>([]);
  const [selected, setSelected] = useState<PracticeRow | null>(null);
  const [contentSort, setContentSort] = useState<'text' | 'onlyimage'>('text');
  const [textContent, setTextContent] = useState<any[]>([]);
  const [imageFilename, setImageFilename] = useState<string>('');
  
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

  // 이미지 압축 및 파일명 생성 함수 (jpg/jpeg/png만 허용)
  const processImageFiles = async (acceptedFiles: File[]) => {
    try {
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
        const originalFile = validFiles[index];
        const mime = originalFile.type || '';
        const extension = mime.includes('png')
          ? '.png'
          : mime.includes('jpeg') || mime.includes('jpg')
            ? '.jpg'
            : '.jpg';
        return new File([resizedFile], `${date}${adminId}_${randomString}${extension}`, {
          type: originalFile.type,
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
    const res = await axios.get(`${MainURL}/main/getpractice`);
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

  const selectRow = (row: PracticeRow) => {
    setSelected(row);
    setContentSort(row.contentSort);
    if (row.contentSort === 'text') {
      // 섹션 구조 [{ title, content: [] }] 유지. 만약 라인 배열이면 무제목 섹션으로 변환
      try {
        const parsed = JSON.parse(row.content || '[]');
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'content' in parsed[0]) {
            setTextContent(parsed as any[]);
          } else {
            const lines = (parsed as any[]).filter((x) => typeof x === 'string');
            setTextContent([{ title: '', content: lines }] as any[]);
          }
        } else {
          setTextContent([]);
        }
      } catch {
        setTextContent([]);
      }
      setImageFilename('');
    } else {
      setTextContent([]);
      setImageFilename(row.content || '');
    }
  };

  const onUploadMainImage = async (file: File): Promise<string | null> => {
    try {
      console.log('이미지 업로드 시작:', file.name, file.size, file.type);
      const form = new FormData();
      form.append('img', file);
      
      console.log('FormData 생성됨, 업로드 URL:', `${MainURL}/main/upload/mainimage`);
      
      const res = await axios.post(`${MainURL}/main/upload/mainimage`, form, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      console.log('서버 응답:', res.data);
      
      if (res.data && res.data.filename) {
        console.log('업로드 성공, 파일명:', res.data.filename);
        return res.data.filename;
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

  const save = async () => {
    if (!selected) return;
    const payload = {
      id: selected.id,
      title: selected.title,
      contentSort,
      content: contentSort === 'text' ? JSON.stringify(textContent) : imageFilename
    };
    const res = await axios.post(`${MainURL}/main/practice/update`, payload);
    if (res.data === true) {
      alert('저장되었습니다.');
      navigate('/admin/main');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  // 섹션 제목 수정
  const updateTextSectionTitle = (index: number, value: string) => {
    const copy = (textContent || []).map((sec: any, i: number) => i === index ? { ...sec, title: value } : sec);
    setTextContent(copy);
  };

  // 섹션 내 항목 수정
  const updateTextSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const copy = (textContent || []).map((sec: any, i: number) => {
      if (i !== sectionIndex) return sec;
      const content = (sec.content || []).map((c: string, ci: number) => ci === itemIndex ? value : c);
      return { ...sec, content };
    });
    setTextContent(copy);
  };

  return (
    <div className="AdminContent adminEditMainInfo">
      <div className="adminEditCard">
        <h3 style={{ marginBottom: 12, textAlign: 'center' }}>후원/실습 수정</h3>
        <div>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{marginBottom: '15px'}}>후원/실습 목록</h4>
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
              <div className="adminField" style={{ alignItems: 'flex-start', marginBottom: 24 }}>
                <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>컨텐츠 유형</label>
                <select 
                  value={contentSort} 
                  onChange={(e)=>setContentSort(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    minWidth: '150px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value='text'>📝 텍스트 컨텐츠</option>
                  <option value='onlyimage'>🖼️ 이미지 컨텐츠</option>
                </select>
              </div>

            {contentSort === 'text' ? (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h5 style={{ margin: 0, color: '#333' }}>📝 텍스트 컨텐츠 편집</h5>
                  <div 
                    className='adminBtn' 
                    style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#4CAF50', color: 'white', display: 'inline-flex', width: 'auto' }}
                    onClick={() => setTextContent([ ...(textContent || []), { title: '', content: [''] } ])}
                  >
                    + 새 섹션 추가
                  </div>
                </div>
                {(textContent || []).map((sec: any, si: number) => (
                  <div key={si} className='adminRepeatCard' style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 16, backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontWeight: 'bold', color: '#555' }}>📋 섹션 {si + 1}</div>
                      <div 
                        onClick={() => {
                          if (window.confirm('이 섹션을 삭제하시겠습니까?')) {
                            const copy = (textContent || []).filter((_: any, i: number) => i !== si);
                            setTextContent(copy);
                          }
                        }}
                        style={{ cursor: 'pointer', color: '#ff4444', fontSize: 14 }}
                      >
                        🗑️
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 4, color: '#666' }}>섹션 제목</label>
                      <input 
                        className='inputdefault' 
                        value={sec.title || ''} 
                        onChange={(e)=> updateTextSectionTitle(si, e.target.value)}
                        placeholder="섹션 제목을 입력하세요"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 8, color: '#666' }}>항목들</label>
                      {(sec.content || []).map((item: string, ii: number) => (
                        <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <input 
                            className='inputdefault' 
                            value={item} 
                            onChange={(e)=> updateTextSectionItem(si, ii, e.target.value)}
                            placeholder={`항목 ${ii + 1}을 입력하세요`}
                            style={{ flex: 1 }}
                          />
                          <div 
                            onClick={() => {
                              if (window.confirm('이 항목을 삭제하시겠습니까?')) {
                                const copy = (textContent || []).map((s: any, i: number) => {
                                  if (i === si) {
                                    const newContent = (s.content || []).filter((_: string, ci: number) => ci !== ii);
                                    return { ...s, content: newContent };
                                  }
                                  return s;
                                });
                                setTextContent(copy);
                              }
                            }}
                            style={{ cursor: 'pointer', color: '#ff4444', fontSize: 16 }}
                          >
                            🗑️
                          </div>
                        </div>
                      ))}
                      <div 
                        className='adminBtn' 
                        style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#2196F3', color: 'white', marginTop: 8, display: 'inline-flex', width: 'auto' }}
                        onClick={() => {
                          const copy = (textContent || []).map((s: any, i: number) => i === si ? { ...s, content: [ ...(s.content || []), '' ] } : s);
                          setTextContent(copy);
                        }}
                      >
                        + 항목 추가
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div 
                    className='adminBtn' 
                    style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#4CAF50', color: 'white', display: 'inline-flex', width: 'auto' }}
                    onClick={() => setTextContent([ ...(textContent || []), { title: '', content: [''] } ])}
                  >
                    + 새 섹션 추가
                  </div>
                </div>
              </div>
            ) : (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <h5 style={{ margin: 0, color: '#333' }}>🖼️ 이미지 컨텐츠 편집</h5>
                    </div>
                    <div className="adminField" style={{ alignItems: 'stretch' }}>
                      <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>이미지 업로드</label>
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
                      <div className='adminBtn' style={{ 
                        marginTop: 12, 
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }} onClick={async () => {
                        if (imageFiles.length === 0) return;
                        const filename = await onUploadMainImage(imageFiles[0]);
                        if (filename) {
                          setImageFilename(filename);
                          setImageFiles([]);
                          alert('이미지가 적용되었습니다.');
                        } else {
                          alert('이미지 업로드에 실패했습니다.');
                        }
                      }}>
                        ✅ 이미지 적용하기
                      </div>
                    )}
                    
                    {imageFilename && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          <img src={`${MainURL}/images/mainimages/${imageFilename}`} 
                             style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8 }} />
                          <div className='adminBtn danger' style={{ fontSize: '10px', padding: '4px 8px' }} onClick={async () => {
                            if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
                              setImageFilename('');
                              alert('이미지가 삭제되었습니다.');
                            }
                          }}>
                            삭제
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ 
                marginTop: 24, 
                display: 'flex', 
                gap: 12, 
                justifyContent: 'center',
                padding: '20px 0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <div 
                  className='btn-row' 
                  onClick={()=>navigate('/admin/main')}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <p style={{ margin: 0 }}>❌ 취소</p>
                </div>
                <div 
                  className='btn-row' 
                  onClick={save}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <p style={{ margin: 0 }}>💾 저장</p>
                </div>
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