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

interface MainDataProps {
  id: string;
  name: string;
  charger: string;
  address: string;
  youtube: string;
  blog: string;
  facebook: string;
  quiry: string;
  supportAccount: string;
  imageMainName: string;
  imageText: string;
  mainLogo: string;
  mainLogoMini: string;
  mainMessage: string;
  mainService: string;
  facility: string;
  placeNaver: string;
  placeKakao: string;
}

export default function EditMainInfo() {
  const navigate = useNavigate();
  const isLogin = useRecoilValue(recoilLoginState);

  const [form, setForm] = useState<MainDataProps | null>(null);
  const [mainMessageList, setMainMessageList] = useState<any[]>([]);
  const [mainServiceList, setMainServiceList] = useState<any[]>([]);
  const [facilityList, setFacilityList] = useState<any[]>([]);
  const [greeting, setGreeting] = useState<{ image?: string; fromname?: string; content?: string[] }>({ image: '', fromname: '', content: [''] });
  const [currentTab, setCurrentTab] = useState<number>(1);

  // 이미지 첨부 관련 상태
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [greetingImageFiles, setGreetingImageFiles] = useState<File[]>([]);
  const [serviceImageFiles, setServiceImageFiles] = useState<{ [key: number]: File[] }>({});
  const [facilityImageFiles, setFacilityImageFiles] = useState<{ [key: number]: File[] }>({});
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number>(-1);
  const [currentFacilityIndex, setCurrentFacilityIndex] = useState<number>(-1);
  
  // 개별 서비스 항목 수정을 위한 상태
  const [editingServiceIndex, setEditingServiceIndex] = useState<number>(-1);
  const [editingService, setEditingService] = useState<any>(null);
  
  // 개별 시설 항목 수정을 위한 상태
  const [editingFacilityIndex, setEditingFacilityIndex] = useState<number>(-1);
  const [editingFacility, setEditingFacility] = useState<any>(null);

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
      
      const adminId = 'admin'; // 관리자 ID
      const fileCopies = resizedFiles.map((resizedFile, index) => {
        const randomString = generateRandomString(10);
        return new File([resizedFile], `${date}${adminId}_${randomString}`, {
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

  // 각 탭별 드롭존 설정
  const greetingDropzone = useDropzone({ 
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      const processedFiles = await processImageFiles(acceptedFiles);
      setGreetingImageFiles(processedFiles);
    }, []) 
  });
  
  const serviceDropzone = useDropzone({ 
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      console.log('서비스 드롭존 onDrop 호출됨, 파일 수:', acceptedFiles.length);
      console.log('현재 서비스 인덱스:', currentServiceIndex);
      const processedFiles = await processImageFiles(acceptedFiles);
      // 현재 선택된 서비스 인덱스가 있으면 해당 인덱스에, 없으면 첫 번째 인덱스에 저장
      const targetIndex = currentServiceIndex >= 0 ? currentServiceIndex : 0;
      console.log('타겟 인덱스:', targetIndex);
      setServiceImageFiles(prev => ({
        ...prev,
        [targetIndex]: processedFiles
      }));
      // 인덱스 초기화
      setCurrentServiceIndex(-1);
    }, [currentServiceIndex]) 
  });
  
  const facilityDropzone = useDropzone({ 
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      const processedFiles = await processImageFiles(acceptedFiles);
      // 현재 선택된 시설 인덱스가 있으면 해당 인덱스에, 없으면 첫 번째 인덱스에 저장
      const targetIndex = currentFacilityIndex >= 0 ? currentFacilityIndex : 0;
      setFacilityImageFiles(prev => ({
        ...prev,
        [targetIndex]: processedFiles
      }));
      // 인덱스 초기화
      setCurrentFacilityIndex(-1);
    }, [currentFacilityIndex]) 
  });

  // 첨부 이미지 삭제 함수들
  const deleteGreetingImage = (idx: number) => {
    const copy = [...greetingImageFiles];
    const newItems = copy.filter((item, i) => i !== idx);
    setGreetingImageFiles(newItems);
  };

  const deleteServiceImage = (serviceIndex: number, fileIndex: number) => {
    setServiceImageFiles(prev => {
      const currentFiles = prev[serviceIndex] || [];
      const newFiles = currentFiles.filter((_, i) => i !== fileIndex);
      return {
        ...prev,
        [serviceIndex]: newFiles
      };
    });
  };

  const deleteFacilityImage = (facilityIndex: number, fileIndex: number) => {
    setFacilityImageFiles(prev => {
      const currentFiles = prev[facilityIndex] || [];
      const newFiles = currentFiles.filter((_, i) => i !== fileIndex);
      return {
        ...prev,
        [facilityIndex]: newFiles
      };
    });
  };

  // 개별 서비스 항목 수정 함수들
  const startEditService = (serviceIndex: number) => {
    setEditingServiceIndex(serviceIndex);
    setEditingService({ ...mainServiceList[serviceIndex] });
    setServiceImageFiles({ [serviceIndex]: [] });
  };

  const cancelEditService = () => {
    setEditingServiceIndex(-1);
    setEditingService(null);
    setServiceImageFiles({});
  };

  // 개별 시설 항목 수정 함수들
  const startEditFacility = (facilityIndex: number) => {
    setEditingFacilityIndex(facilityIndex);
    setEditingFacility({ ...facilityList[facilityIndex] });
    setFacilityImageFiles({ [facilityIndex]: [] });
  };

  const cancelEditFacility = () => {
    setEditingFacilityIndex(-1);
    setEditingFacility(null);
    setFacilityImageFiles({});
  };

  const saveFacilityItem = async (facilityIndex: number) => {
    if (!editingFacility) return;

    try {
      // 이미지가 첨부된 경우 업로드
      let imageFilename = editingFacility.image;
      if (facilityImageFiles[facilityIndex] && facilityImageFiles[facilityIndex].length > 0) {
        const uploadedFilename = await uploadImage(facilityImageFiles[facilityIndex][0]);
        if (uploadedFilename) {
          imageFilename = uploadedFilename;
        }
      }

      // 서버에 개별 항목 업데이트 요청
      const payload = {
        id: form?.id,
        title: editingFacility.title,
        image: imageFilename,
        index: facilityIndex
      };

      const res = await axios.post(`${MainURL}/main/updatefacilityitem`, payload);
      if (res.data === true) {
        // 로컬 상태 업데이트
        const updatedFacilityList = facilityList.map((item, i) => 
          i === facilityIndex ? { ...editingFacility, image: imageFilename } : item
        );
        setFacilityList(updatedFacilityList);

        // 수정 모드 종료
        setEditingFacilityIndex(-1);
        setEditingFacility(null);
        setFacilityImageFiles({});

        alert('시설 항목이 저장되었습니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('시설 항목 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const saveServiceItem = async (serviceIndex: number) => {
    if (!editingService) return;
    
    try {
      // 이미지가 첨부된 경우 업로드
      let imageFilename = editingService.image;
      if (serviceImageFiles[serviceIndex] && serviceImageFiles[serviceIndex].length > 0) {
        const uploadedFilename = await uploadImage(serviceImageFiles[serviceIndex][0]);
        if (uploadedFilename) {
          imageFilename = uploadedFilename;
        }
      }

      // 서버에 개별 항목 업데이트 요청
      const payload = {
        id: form?.id,
        title: editingService.title,
        content: editingService.content,
        image: imageFilename,
        index: serviceIndex
      };

      const res = await axios.post(`${MainURL}/main/updateserviceitem`, payload);
      if (res.data === true) {
        // 로컬 상태 업데이트
        const updatedServiceList = mainServiceList.map((item, i) => 
          i === serviceIndex ? { ...editingService, image: imageFilename } : item
        );
        setMainServiceList(updatedServiceList);
        
        // 수정 모드 종료
        setEditingServiceIndex(-1);
        setEditingService(null);
        setServiceImageFiles({});
        
        alert('서비스 항목이 저장되었습니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('서비스 항목 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log('이미지 업로드 시작:', file.name, file.size, file.type);
      const fd = new FormData();
      fd.append('img', file);
      
      console.log('FormData 생성됨, 업로드 URL:', `${MainURL}/main/upload/notice`);
      
      const res = await axios.post(`${MainURL}/main/upload/notice`, fd, { 
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

  const fetchMain = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`);
    if (res.data && res.data.length > 0) {
      const base = res.data[0];
      setForm(base);
      try { setGreeting(base.greeting ? JSON.parse(base.greeting) : { image: '', fromname: '', content: [''] }); } catch { setGreeting({ image: '', fromname: '', content: [''] }); }
      try { setMainMessageList(base.mainMessage ? JSON.parse(base.mainMessage) : []); } catch { setMainMessageList([]); }
      try { setMainServiceList(base.mainService ? JSON.parse(base.mainService) : []); } catch { setMainServiceList([]); }
      try { setFacilityList(base.facility ? JSON.parse(base.facility) : []); } catch { setFacilityList([]); }
    }
  };

  useEffect(() => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      navigate('/admin');
      return;
    }
    fetchMain();
  }, []);

  const updateField = (key: keyof MainDataProps, value: string) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const save = async () => {
    if (!form) return;
    const payload = {
      ...form,
      greeting: JSON.stringify(greeting || {}),
      mainMessage: JSON.stringify(mainMessageList || []),
      mainService: JSON.stringify(mainServiceList || []),
      facility: JSON.stringify(facilityList || []),
    };
    const res = await axios.post(`${MainURL}/main/updatemaininfo`, payload);
    if (res.data === true) {
      alert('저장되었습니다.');
      navigate('/admin/main');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const buttonStyle = {
    width:'150px',
    backgroundColor:'#fff',
    color:'#333',
    border:'1px solid #ccc',
    padding:'8px 12px',
    borderRadius:'4px',
    fontSize:'12px',
    cursor:'pointer',
  }

  if (!form) return <div className="AdminContent adminEditMainInfo">불러오는 중...</div>;

  return (
    <div className="AdminContent adminEditMainInfo">
      <div className="adminEditCard">
        <div className='adminTabs'>
          <div className={`adminTab ${currentTab===1 ? 'active' : ''}`} onClick={()=>setCurrentTab(1)}>인사말</div>
          <div className={`adminTab ${currentTab===2 ? 'active' : ''}`} onClick={()=>setCurrentTab(2)}>제공 서비스</div>
          <div className={`adminTab ${currentTab===3 ? 'active' : ''}`} onClick={()=>setCurrentTab(3)}>시설 사진</div>
          <div className={`adminTab ${currentTab===4 ? 'active' : ''}`} onClick={()=>setCurrentTab(4)}>시설 정보</div>
          <div className={`adminTab ${currentTab===5 ? 'active' : ''}`} onClick={()=>setCurrentTab(5)}>오시는 길</div>
        </div>

       
        {currentTab === 1 && (
          <div>
            <div className="adminField">
              <label>작성자</label>
              <input className="inputdefault" value={greeting.fromname || ''} onChange={(e)=> setGreeting({ ...greeting, fromname: e.target.value })} />
            </div>
            <div className="adminField">
              <label>내용</label>
              <div className='adminRepeater'>
                {(greeting.content || []).map((line:string, idx:number)=> (
                  <textarea 
                    key={idx} 
                    className='inputdefault' 
                    value={line} 
                    onChange={(e)=>{
                      const c = (greeting.content || []).map((t, i)=> i===idx ? e.target.value : t);
                      setGreeting({ ...greeting, content: c });
                    }}
                    style={{ resize: 'none', height: '100px', textAlign: 'left' }}
                  />
                ))}
                <div className='adminBtnRow'>
                  <div className='adminBtn' onClick={()=> setGreeting({ ...greeting, content: [ ...(greeting.content || []), '' ] })}>문장 추가</div>
                  <div className='adminBtn danger' onClick={()=> setGreeting({ ...greeting, content: (greeting.content || []).slice(0, -1) })}>마지막 삭제</div>
                </div>
              </div>
            </div>
          </div>
        )}


        {currentTab === 2 && (
          <div>
            <div className="adminField">
              <label>제공 서비스</label>
              <div className="adminRepeater">
                {mainServiceList.map((svc:any, si:number)=> (
                  <div key={si} className="adminRepeatCard" style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    marginBottom: '16px',
                    backgroundColor: '#fafafa'
                  }}>
                    {/* 서비스 항목 표시 영역 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{svc.title || '제목 없음'}</h4>
                        {svc.image && (
                          <img src={`${MainURL}/images/notice/${svc.image}`} 
                               style={{ width:'150px', height:'100px', objectFit:'cover', borderRadius:6, marginBottom: '8px' }} />
                        )}
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          {(svc.content || []).map((line:string, li:number)=> (
                            <div key={li} style={{ marginBottom: '4px' }}>• {line}</div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <div 
                          className='adminBtn' 
                          style={{ 
                            backgroundColor: '#2196F3', 
                            color: 'white', 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            borderRadius: '4px'
                          }}
                          onClick={() => startEditService(si)}
                        >
                          ✏️ 수정
                        </div>
                        <div 
                          className='adminBtn danger' 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            borderRadius: '4px'
                          }}
                          onClick={async () => {
                            if (window.confirm(`<${svc.title}> 서비스 항목을 삭제하시겠습니까? 삭제후에는 되돌릴수 없습니다.`)) {
                              try {
                                // 서버에 삭제 요청
                                const payload = {
                                  id: form?.id,
                                  index: si,
                                  action: 'delete'
                                };
                                
                                const res = await axios.post(`${MainURL}/main/updateserviceitem`, payload);
                                if (res.data === true) {
                                  // 로컬 상태에서도 삭제
                                  const copy = mainServiceList.filter((_:any, i:number)=> i!==si);
                                  setMainServiceList(copy);
                                  alert('서비스 항목이 삭제되었습니다.');
                                } else {
                                  alert('삭제에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('서비스 항목 삭제 오류:', error);
                                alert('삭제 중 오류가 발생했습니다.');
                              }
                            }
                          }}
                        >
                          🗑️ 삭제
                        </div>
                      </div>
                    </div>

                    {/* 수정 모드 영역 */}
                    {editingServiceIndex === si && editingService && (
                      <div style={{ 
                        border: '2px solid #2196F3', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        backgroundColor: '#f8f9ff',
                        marginTop: '12px'
                      }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#2196F3' }}>✏️ 서비스 수정</h5>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>서비스 제목</label>
                          <input
                            className="inputdefault" 
                            placeholder="서비스 제목" 
                            value={editingService.title || ''} 
                            onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                            style={{ width: '100%' }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>서비스 내용</label>
                          {(editingService.content || []).map((line:string, li:number)=> (
                            <div key={li} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                              <input
                                className="inputdefault" 
                                placeholder="내용" 
                                value={line} 
                                onChange={(e) => {
                                  const newContent = (editingService.content || []).map((x:string, xi:number)=> xi===li ? e.target.value : x);
                                  setEditingService({ ...editingService, content: newContent });
                                }}
                                style={{ flex: 1 }}
                              />
                              <div 
                                onClick={() => {
                                  const newContent = (editingService.content || []).filter((_:string, xi:number)=> xi !== li);
                                  setEditingService({ ...editingService, content: newContent });
                                }}
                                style={{ cursor: 'pointer', color: '#ff4444', fontSize: '16px' }}
                              >
                                🗑️
                              </div>
                            </div>
                          ))}
                          <div 
                            className='adminBtn' 
                            style={{ 
                              fontSize: '12px', 
                              padding: '4px 8px', 
                              backgroundColor: '#4CAF50',
                              color: 'white', 
                              marginTop: '8px',
                              display: 'inline-flex',
                              width: 'auto'
                            }}
                            onClick={() => {
                              setEditingService({ 
                                ...editingService, 
                                content: [...(editingService.content || []), ''] 
                              });
                            }}
                          >
                            + 항목 추가
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>이미지</label>
                          {editingService.image && (
                            <div style={{ marginBottom: '8px' }}>
                              <img src={`${MainURL}/images/notice/${editingService.image}`} 
                                   style={{ width:'150px', height:'100px', objectFit:'cover', borderRadius:6 }} />
                              <div 
                                className='adminBtn danger' 
                                style={{ 
                                  fontSize: '10px', 
                                  padding: '4px 8px', 
                                  marginLeft: '8px',
                                  display: 'inline-flex',
                                  width: 'auto'
                                }}
                                onClick={async () => {
                                  if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
                                    try {
                                      const res = await axios.post(`${MainURL}/main/deleteimage`, { filename: editingService.image });
                                      if (res.data === true) {
                                        setEditingService({ ...editingService, image: '' });
                                        alert('이미지가 삭제되었습니다.');
                                      } else {
                                        alert('이미지 삭제에 실패했습니다.');
                                      }
                                    } catch (error) {
                                      console.error('이미지 삭제 오류:', error);
                                      alert('이미지 삭제 중 오류가 발생했습니다.');
                                    }
                                  }
                                }}
                              >
                                기존 이미지 삭제
                              </div>
                            </div>
                          )}
                          
                          <div className="imageInputBox" style={{ position: 'relative' }}>
                            {imageLoading ? (
                              <div style={{width:'100%', height:'100%', position:'absolute'}}>
                                <Loading/>
                              </div>
                            ) : (
                              <div className='imageDropzoneCover'>
                                <div 
                                  className="imageDropzoneStyle"
                                  onClick={() => {
                                    console.log('서비스 드롭존 클릭됨, 인덱스:', si);
                                    setCurrentServiceIndex(si);
                                  }}
                                >
                                  <div {...serviceDropzone.getRootProps()}>
                                    <input {...serviceDropzone.getInputProps()} />
                                    {(serviceImageFiles[si] || []).length > 0 
                                      ? <div className='imageplus' style={buttonStyle}>+ 다시첨부하기</div>
                                      : <div className='imageplus' style={buttonStyle}>+ 이미지첨부하기</div>
                                    }
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {(serviceImageFiles[si] || []).length > 0 && serviceImageFiles[si].map((item: File, index: number) => (
                              <div key={index} className='imagebox'>
                                <img style={{width:'150px', height:'100px', objectFit:'cover', borderRadius:6}}
                                  src={URL.createObjectURL(item)}
                                />
                                <p style={{ fontSize: '12px' }}>{item.name}</p>
                                <div onClick={() => deleteServiceImage(si, index)}>
                                  <CiCircleMinus color='#FF0000' size={20} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <div 
                            className='adminBtn' 
                            style={{ 
                              backgroundColor: '#f5f5f5', 
                              color: '#666', 
                              padding: '8px 16px',
                              fontSize: '12px'
                            }}
                            onClick={cancelEditService}
                          >
                            ❌ 취소
                          </div>
                          <div 
                            className='adminBtn' 
                            style={{ 
                              backgroundColor: '#4CAF50', 
                              color: 'white', 
                              padding: '8px 16px',
                              fontSize: '12px'
                            }}
                            onClick={() => saveServiceItem(si)}
                          >
                            💾 저장
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className='adminBtn' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc'}}
                  onClick={()=> {
                    const newService = { title: '', content: [''], image: '' };
                    setMainServiceList([ ...mainServiceList, newService ]);
                    // 새로 추가된 항목을 바로 수정 모드로 설정
                    const newIndex = mainServiceList.length;
                    setTimeout(() => {
                      startEditService(newIndex);
                    }, 100);
                  }}>+ 서비스 추가</div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 3 && (
          <div>
            <div className="adminField">
              <label>시설 정보</label>
              <div className="adminRepeater">
                {facilityList.map((fc:any, fi:number)=> (
                  <div key={fi} className="adminRepeatCard" style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    marginBottom: '16px',
                    backgroundColor: '#fafafa'
                  }}>
                    {/* 표시 영역 */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{fc.title || '시설명 없음'}</h4>
                        {fc.image && (
                          <img src={`${MainURL}/images/notice/${fc.image}`} 
                            style={{ width:'200px', height:'auto', objectFit:'cover', borderRadius:6, marginBottom:8 }} />
                        )}
                      </div>
                      <div style={{ display:'flex', gap:8, marginLeft:16 }}>
                        <div 
                          className='adminBtn'
                          style={{ backgroundColor:'#2196F3', color:'#fff', padding:'6px 12px', fontSize:12, borderRadius:4 }}
                          onClick={() => startEditFacility(fi)}
                        >
                          ✏️ 수정
                        </div>
                        <div 
                          className='adminBtn danger'
                          style={{ padding:'6px 12px', fontSize:12, borderRadius:4 }}
                          onClick={async () => {
                            if (window.confirm(`<${fc.title || '시설'}> 항목을 삭제하시겠습니까? 삭제후에는 되돌릴 수 없습니다.`)) {
                              try {
                                const payload = { id: form?.id, index: fi, action: 'delete' };
                                const res = await axios.post(`${MainURL}/main/updatefacilityitem`, payload);
                                if (res.data === true) {
                                  const copy = facilityList.filter((_:any, i:number)=> i!==fi);
                                  setFacilityList(copy);
                                  alert('시설 항목이 삭제되었습니다.');
                                } else {
                                  alert('삭제에 실패했습니다.');
                                }
                              } catch (error) {
                                console.error('시설 항목 삭제 오류:', error);
                                alert('삭제 중 오류가 발생했습니다.');
                              }
                            }
                          }}
                        >
                          🗑️ 삭제
                        </div>
                      </div>
                    </div>

                    {/* 수정 모드 */}
                    {editingFacilityIndex === fi && editingFacility && (
                      <div style={{ border:'2px solid #2196F3', borderRadius:8, padding:16, backgroundColor:'#f8f9ff', marginTop:12 }}>
                        <h5 style={{ margin:'0 0 12px 0', color:'#2196F3' }}>✏️ 시설 수정</h5>

                        <div style={{ marginBottom:12 }}>
                          <label style={{ display:'block', marginBottom:4, fontWeight:'bold' }}>시설명</label>
                          <input 
                            className="inputdefault"
                            placeholder="시설명"
                            value={editingFacility.title || ''}
                            onChange={(e) => setEditingFacility({ ...editingFacility, title: e.target.value })}
                            style={{ width:'100%' }}
                          />
                        </div>

                        <div style={{ marginBottom:12 }}>
                          <label style={{ display:'block', marginBottom:4, fontWeight:'bold' }}>이미지</label>
                          {editingFacility.image && (
                            <div style={{ marginBottom:8 }}>
                              <img src={`${MainURL}/images/notice/${editingFacility.image}`} style={{ width:200, height:'auto', objectFit:'cover', borderRadius:6 }} />
                              <div 
                                className='adminBtn danger'
                                style={{ fontSize:10, padding:'4px 8px', marginLeft:8, display:'inline-flex', width:'auto' }}
                                onClick={async () => {
                                  if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
                                    try {
                                      const res = await axios.post(`${MainURL}/main/deleteimage`, { filename: editingFacility.image });
                                      if (res.data === true) {
                                        setEditingFacility({ ...editingFacility, image: '' });
                                        alert('이미지가 삭제되었습니다.');
                                      } else {
                                        alert('이미지 삭제에 실패했습니다.');
                                      }
                                    } catch (error) {
                                      console.error('이미지 삭제 오류:', error);
                                      alert('이미지 삭제 중 오류가 발생했습니다.');
                                    }
                                  }
                                }}
                              >
                                기존 이미지 삭제
                              </div>
                            </div>
                          )}

                          <div className="imageInputBox" style={{ position:'relative' }}>
                            {imageLoading ? (
                              <div style={{width:'100%', height:'100%', position:'absolute'}}>
                                <Loading/>
                              </div>
                            ) : (
                              <div className='imageDropzoneCover'>
                                <div 
                                  className="imageDropzoneStyle"
                                  onClick={() => setCurrentFacilityIndex(fi)}
                                >
                                  <div {...facilityDropzone.getRootProps()}>
                                    <input {...facilityDropzone.getInputProps()} />
                                    {(facilityImageFiles[fi] || []).length > 0 
                                      ? <div className='imageplus' style={buttonStyle}>+ 다시첨부하기</div>
                                      : <div className='imageplus' style={buttonStyle}>+ 이미지첨부하기</div>
                                    }
                                  </div>
                                </div>
                              </div>
                            )}

                            {(facilityImageFiles[fi] || []).length > 0 && facilityImageFiles[fi].map((item: File, index: number) => (
                              <div key={index} className='imagebox'>
                                <img style={{width:200, height:'auto', objectFit:'cover', borderRadius:6}} src={URL.createObjectURL(item)} />
                                <p>{item.name}</p>
                                <div onClick={() => deleteFacilityImage(fi, index)}>
                                  <CiCircleMinus color='#FF0000' size={20} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                          <div className='adminBtn' style={{ backgroundColor:'#f5f5f5', color:'#666', padding:'8px 16px', fontSize:12 }} onClick={cancelEditFacility}>❌ 취소</div>
                          <div className='adminBtn' style={{ backgroundColor:'#4CAF50', color:'#fff', padding:'8px 16px', fontSize:12 }} onClick={() => saveFacilityItem(fi)}>💾 저장</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className='adminBtn' style={{backgroundColor:'#fff', color:'#333', border:'1px solid #ccc'}}
                  onClick={()=> {
                    const newItem = { title: '', image: '' };
                    setFacilityList([ ...facilityList, newItem ]);
                    const newIndex = facilityList.length;
                    setTimeout(() => { startEditFacility(newIndex); }, 100);
                  }}>시설 추가</div> 
              </div>
            </div>
          </div>
        )}

        {currentTab === 4 && (
          <div>
            <div className="adminField">
              <label>이름</label>
              <input className="inputdefault" value={form.name || ''} onChange={(e)=>updateField('name', e.target.value)} />
            </div>
            <div className="adminField">
              <label>센터장</label>
              <input className="inputdefault" value={form.charger || ''} onChange={(e)=>updateField('charger', e.target.value)} />
            </div>
            <div className="adminField">
              <label>주소</label>
              <input className="inputdefault" value={form.address || ''} onChange={(e)=>updateField('address', e.target.value)} />
            </div>
            <div className="adminField">
              <label>유튜브</label>
              <input className="inputdefault" value={form.youtube || ''} onChange={(e)=>updateField('youtube', e.target.value)} />
            </div>
            <div className="adminField">
              <label>블로그</label>
              <input className="inputdefault" value={form.blog || ''} onChange={(e)=>updateField('blog', e.target.value)} />
            </div>
            <div className="adminField">
              <label>페이스북</label>
              <input className="inputdefault" value={form.facebook || ''} onChange={(e)=>updateField('facebook', e.target.value)} />
            </div>
            <div className="adminField">
              <label>문의</label>
              <input className="inputdefault" value={form.quiry || ''} onChange={(e)=>updateField('quiry', e.target.value)} />
            </div>
            <div className="adminField">
              <label>후원계좌</label>
              <input className="inputdefault" value={form.supportAccount || ''} onChange={(e)=>updateField('supportAccount', e.target.value)} />
            </div>
            <div className="adminField">
              <label>메인 이미지 텍스트</label>
              <input className="inputdefault" value={form.imageText || ''} onChange={(e)=>updateField('imageText', e.target.value)} />
            </div>
          </div>
        )}

        {currentTab === 5 && (
          <div>
            <div className="adminField">
              <label>네이버 지도</label>
              <input className="inputdefault" value={form.placeNaver || ''} onChange={(e)=>updateField('placeNaver', e.target.value)} />
            </div>
            <div className="adminField">
              <label>카카오 지도</label>
              <input className="inputdefault" value={form.placeKakao || ''} onChange={(e)=>updateField('placeKakao', e.target.value)} />
            </div>
            <div className="adminField">
              <label>주소</label>
              <input className="inputdefault" value={form.address || ''} onChange={(e)=>updateField('address', e.target.value)} />
            </div>
          </div>
        )}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <div className='btn-row' onClick={()=>navigate('/admin/main')}><p>취소</p></div>
          <div className='btn-row' onClick={save}><p>저장</p></div>
        </div>
      </div>
    </div>
  );
}


