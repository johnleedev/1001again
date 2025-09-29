import React, { useEffect, useState } from 'react';
import MainURL from '../../../MainURL';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye, MdOutlineAccessTime } from "react-icons/md";
import DateFormmating from '../../../components/DateFormmating';
import { useRecoilValue } from 'recoil';
import { recoilLoginState, recoilUserData } from '../../../RecoilStore';
import Footer from '../../../components/Footer';



export default function BoardDetail (props:any) {

  const ID = props.ID;
  let navigate = useNavigate();
  const location = useLocation();
  const propsData = location.state;
  const isLogin = useRecoilValue(recoilLoginState);
  const userData = useRecoilValue(recoilUserData);
  
  const images = location.state.images ? JSON.parse(location.state.images) : [];

  // 편집 상태
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editDate, setEditDate] = useState<string>(propsData?.date || '');
  const [editTitle, setEditTitle] = useState<string>(propsData?.title || '');
  const [editContent, setEditContent] = useState<string>(propsData?.content || '');

  const startEdit = () => {
    setEditTitle(propsData?.title || '');
    setEditDate(propsData?.date || '');
    setEditContent(propsData?.content || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    try {
      const payload = {
        id: propsData.id,
        title: editTitle,
        content: editContent
      };
      const res = await axios.post(`${MainURL}/board/updatepost`, payload);
      if (res.data === true) {
        alert('수정되었습니다.');
        // 로컬 표시 즉시 반영
        propsData.title = editTitle;
        propsData.content = editContent;
        setIsEditing(false);
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (e) {
      console.error('게시글 수정 오류:', e);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 게시글 삭제 함수 ----------------------------------------------
  const deletePost = () => {
    axios
      .post(`${MainURL}/board/deletepost`, {
        postId : propsData.id,
        userAccount : propsData.userAccount,
        images : images
      })
      .then((res) => {
        if (res.data === true) {
          alert('삭제되었습니다.');
          navigate('/board'); 
        } 
      });
  };


  return (
    <div className='board'>

      <div className="inner">

        <div className="subpage__main">

          <div className="subpage__main__title">
            <h3>공지사항</h3>
            <div style={{display:'flex'}}>
              <div className='postBtnbox'
                style={{marginRight:'10px'}}
                onClick={()=>{
                  navigate('/board'); 
                }}
              >
                <p>목록</p>
              </div>
              {
                (isLogin && userData.authInstitution === ID) &&
                <div className='postBtnbox'
                  style={{marginRight:'10px'}}
                  onClick={startEdit}
                >
                  <p>수정</p>
                </div>
              }
              {
                (isLogin && userData.authInstitution === ID) &&
                <div className='postBtnbox'
                  style={{marginRight:'10px'}}
                  onClick={()=>{
                    deletePost();
                  }}
                >
                  <p>삭제</p>
                </div>
              }
            </div>
          </div>
          
          <div className="subpage__main__content">
            
            <div className="top_box">
              <div className="left">
                <h1>{propsData.title}</h1>
                <p>글쓴이: {propsData.userNickName}님</p>
              </div>
              <div className="right">
                <div className='contentcover'>
                  <div className="box">
                    <MdOutlineAccessTime color='#325382'/>
                    <p>{DateFormmating(propsData.date)}</p>
                  </div>
                  <div className="box">
                    <MdOutlineRemoveRedEye color='#325382'/>
                    <p>{propsData.views}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="view_content">
              <div className='imagecover'>
              { images.length > 0 &&
                images.map((item:any, index:any)=>{
                  return (
                    <img src={`${MainURL}/images/board/${item}`} key={index}/>
                  )
                })
              }
              </div>
              {isEditing ? (
                <div className='addPostBox' style={{ width:'100%' }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'end'}}>
                    <p>날짜</p>
                  </div>
                  <input
                    className='inputdefault'
                    value={editDate}
                    maxLength={200}
                    onChange={(e)=>setEditDate(e.target.value)}
                    placeholder='제목'
                  />
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'end'}}>
                    <p>제목</p>
                    <h5 style={{fontSize:'12px'}}>* 최대 200자</h5>
                  </div>
                  <input
                    className='inputdefault'
                    value={editTitle}
                    maxLength={200}
                    onChange={(e)=>setEditTitle(e.target.value)}
                    placeholder='제목'
                  />
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginTop:'20px'}}>
                    <p>본문</p>
                    <h5 style={{fontSize:'12px'}}>* 최대 2000자</h5>
                  </div>
                  <textarea
                    className='textarea textareapost'
                    value={editContent}
                    maxLength={2000}
                    onChange={(e)=>setEditContent(e.target.value)}
                    placeholder='내용'
                  />
                  <div className='buttonbox' style={{ marginTop: 16 }}>
                    <div className='button' onClick={cancelEdit}><p>취소</p></div>
                    <div className='button' onClick={saveEdit}><p>저장</p></div>
                  </div>
                </div>
              ) : (
                <div className='textcover'>
                  <p>{propsData.content}</p>
                </div>
              )}

            </div>

          
          </div>
          
        </div>
      </div>

      <Footer />
      
    </div>
  )
}



