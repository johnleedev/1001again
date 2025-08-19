import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainURL from '../../MainURL';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilLoginState } from '../../RecoilStore';

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

  const onAddImage = (file: File) => {
    const form = new FormData();
    form.append('img', file);
    axios.post(`${MainURL}/main/upload/gallery`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        if (res.data?.filenames?.length > 0) {
          const filename = res.data.filenames[0];
          const copy = [...images, { image: filename, subtitle: '', date: '' }];
          setImages(copy);
        }
      });
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
                <div className="adminField" style={{ alignItems: 'stretch' }}>
                  <label>이미지 추가</label>
                  <input type='file' onChange={(e)=>{ if (e.target.files && e.target.files[0]) onAddImage(e.target.files[0]); }} />
                </div>
                {images.map((img, idx) => (
                  <div key={idx} className="adminRepeatCard" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 8, alignItems: 'center' }}>
                    <img src={`${MainURL}/images/gallery/${img.image}`} style={{ width: 120, height: 80, objectFit: 'cover' }} />
                    <input placeholder='부제목' className='inputdefault' value={img.subtitle || ''} onChange={(e)=>updateImageField(idx, 'subtitle', e.target.value)} />
                    <input placeholder='날짜' className='inputdefault' value={img.date || ''} onChange={(e)=>updateImageField(idx, 'date', e.target.value)} />
                  </div>
                ))}
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


