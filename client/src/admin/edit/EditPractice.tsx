import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainURL from '../../MainURL';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilLoginState } from '../../RecoilStore';

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
      try { setTextContent(JSON.parse(row.content || '[]')); } catch { setTextContent([]); }
      setImageFilename('');
    } else {
      setTextContent([]);
      setImageFilename(row.content || '');
    }
  };

  const onUploadMainImage = (file: File) => {
    const form = new FormData();
    form.append('img', file);
    axios.post(`${MainURL}/main/upload/mainimage`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        if (res.data?.filename) {
          setImageFilename(res.data.filename);
        }
      });
  };

  const save = async () => {
    if (!selected) return;
    const payload = {
      id: selected.id,
      title: selected.title,
      contentSort,
      content: contentSort === 'text' ? JSON.stringify(textContent) : imageFilename,
      date: selected.date
    };
    const res = await axios.post(`${MainURL}/main/practice/update`, payload);
    if (res.data === true) {
      alert('저장되었습니다.');
      navigate('/admin/main');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const updateTextSectionTitle = (index: number, value: string) => {
    const copy = textContent.map((it, i) => i === index ? { ...it, title: value } : it);
    setTextContent(copy);
  };
  const updateTextSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const copy = textContent.map((sec, i) => {
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
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 280 }}>
            <h4>목록</h4>
            {rows.map((r) => (
              <div key={r.id} className='amdin_Main_Box' onClick={()=>selectRow(r)} style={{ marginBottom: 8 }}>
                {r.title} (id: {r.id})
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {selected ? (
              <div>
                <h4>선택됨: {selected.title}</h4>
                <div className="adminField" style={{ alignItems: 'flex-start' }}>
                  <label>컨텐츠 유형</label>
                  <select value={contentSort} onChange={(e)=>setContentSort(e.target.value as any)}>
                    <option value='text'>텍스트</option>
                    <option value='onlyimage'>이미지</option>
                  </select>
                </div>

                {contentSort === 'text' ? (
                  <div>
                    {textContent.map((sec: any, si: number) => (
                      <div key={si} className='adminRepeatCard'>
                        <div style={{ marginBottom: 8 }}>섹션 제목</div>
                        <input className='inputdefault' value={sec.title || ''} onChange={(e)=>updateTextSectionTitle(si, e.target.value)} />
                        <div style={{ marginTop: 8 }}>항목</div>
                        {(sec.content || []).map((item: string, ii: number) => (
                          <input key={ii} style={{ marginTop: 6 }} className='inputdefault' value={item} onChange={(e)=>updateTextSectionItem(si, ii, e.target.value)} />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="adminField" style={{ alignItems: 'stretch' }}>
                      <label>이미지 업로드</label>
                      <input type='file' onChange={(e)=>{ if (e.target.files && e.target.files[0]) onUploadMainImage(e.target.files[0]); }} />
                    </div>
                    {imageFilename && (
                      <img src={`${MainURL}/images/mainimages/${imageFilename}`} style={{ width: 240, height: 160, objectFit: 'cover' }} />
                    )}
                  </div>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <div className='btn-row' onClick={()=>navigate('/admin/main')}><p>취소</p></div>
                  <div className='btn-row' onClick={save}><p>저장</p></div>
                </div>
              </div>
            ) : (
              <div>왼쪽에서 항목을 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


