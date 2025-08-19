import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainURL from '../../MainURL';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilLoginState } from '../../RecoilStore';

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
              <label>대표 이미지</label>
              {greeting.image && <img src={`${MainURL}/images/notice/${greeting.image}`} style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
              <input type='file' onChange={(e)=>{
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const fd = new FormData();
                fd.append('img', f);
                axios.post(`${MainURL}/main/upload/notice`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                  .then((res)=>{
                    const filename = res.data?.filename;
                    if (!filename) return;
                    setGreeting({ ...greeting, image: filename });
                  });
              }} />
            </div>
            <div className="adminField">
              <label>작성자명</label>
              <input className="inputdefault" value={greeting.fromname || ''} onChange={(e)=> setGreeting({ ...greeting, fromname: e.target.value })} />
            </div>
            <div className="adminField">
              <label>내용</label>
              <div className='adminRepeater'>
                {(greeting.content || []).map((line:string, idx:number)=> (
                  <input key={idx} className='inputdefault' value={line} onChange={(e)=>{
                    const c = (greeting.content || []).map((t, i)=> i===idx ? e.target.value : t);
                    setGreeting({ ...greeting, content: c });
                  }} />
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
                  <div key={si} className="adminRepeatCard">
                    <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
                      {svc.image && <img src={`${MainURL}/images/notice/${svc.image}`} style={{ width:100, height:70, objectFit:'cover', borderRadius:6 }} />}
                      <input type='file' onChange={(e)=>{
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('img', f);
                        axios.post(`${MainURL}/main/upload/notice`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                          .then((res)=>{
                            const filename = res.data?.filename;
                            if (!filename) return;
                            const copy = mainServiceList.map((it:any, i:number)=> i===si ? { ...it, image: filename } : it);
                            setMainServiceList(copy);
                          });
                      }} />
                    </div>
                    <input className="inputdefault" placeholder="서비스 제목" value={svc.title || ''} onChange={(e)=>{
                      const copy = mainServiceList.map((it:any, i:number)=> i===si ? { ...it, title: e.target.value } : it);
                      setMainServiceList(copy);
                    }} />
                    {(svc.content || []).map((line:string, li:number)=> (
                      <input key={li} className="inputdefault" placeholder="내용" value={line} onChange={(e)=>{
                        const copy = mainServiceList.map((it:any, i:number)=>{
                          if (i!==si) return it;
                          const c = (it.content || []).map((x:string, xi:number)=> xi===li ? e.target.value : x);
                          return { ...it, content: c };
                        });
                        setMainServiceList(copy);
                      }} />
                    ))}
                    <div className="adminBtnRow">
                      <div className='adminBtn' onClick={()=>{
                        const copy = mainServiceList.map((it:any, i:number)=> i===si ? { ...it, content: [ ...(it.content || []), '' ] } : it);
                        setMainServiceList(copy);
                      }}>항목 추가</div>
                      <div className='adminBtn danger' onClick={()=>{
                        const copy = mainServiceList.filter((_:any, i:number)=> i!==si);
                        setMainServiceList(copy);
                      }}>삭제</div>
                    </div>
                  </div>
                ))}
                <div className='adminBtn' onClick={()=> setMainServiceList([ ...mainServiceList, { title: '', content: [''], image: '' } ])}>서비스 추가</div>
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
                  <div key={fi} className="adminRepeatCard">
                    <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
                      {fc.image && <img src={`${MainURL}/images/notice/${fc.image}`} style={{ width:100, height:70, objectFit:'cover', borderRadius:6 }} />}
                      <input type='file' onChange={(e)=>{
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('img', f);
                        axios.post(`${MainURL}/main/upload/notice`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                          .then((res)=>{
                            const filename = res.data?.filename;
                            if (!filename) return;
                            const copy = facilityList.map((it:any, i:number)=> i===fi ? { ...it, image: filename } : it);
                            setFacilityList(copy);
                          });
                      }} />
                    </div>
                    <input className="inputdefault" placeholder="시설명" value={fc.title || ''} onChange={(e)=>{
                      const copy = facilityList.map((it:any, i:number)=> i===fi ? { ...it, title: e.target.value } : it);
                      setFacilityList(copy);
                    }} />
                    <div className="adminBtnRow">
                      <div className='adminBtn danger' onClick={()=>{
                        const copy = facilityList.filter((_:any, i:number)=> i!==fi);
                        setFacilityList(copy);
                      }}>삭제</div>
                    </div>
                  </div>
                ))}
                <div className='adminBtn' onClick={()=> setFacilityList([ ...facilityList, { title: '', image: '' } ])}>시설 추가</div>
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


