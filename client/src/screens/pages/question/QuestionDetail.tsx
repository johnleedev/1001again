import React, { useEffect, useState } from 'react';
import MainURL from '../../../MainURL';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye, MdOutlineAccessTime } from "react-icons/md";
import DateFormmating from '../../../components/DateFormmating';
import { useRecoilValue } from 'recoil';
import { recoilLoginState, recoilUserData } from '../../../RecoilStore';



export default function QuestionDetail (props:any) {

  const ID = props.ID;
  let navigate = useNavigate();
  const location = useLocation();
  const propsData = location.state;
  const isLogin = useRecoilValue(recoilLoginState);
  const userData = useRecoilValue(recoilUserData);
  
  // 게시글 삭제 함수 ----------------------------------------------
  const deletePost = () => {
    axios
      .post(`${MainURL}/board/deletequestion`, {
          postId : propsData.id,
        })
      .then((res) => {
        if (res.data === true) {
          alert('삭제되었습니다.');
          navigate('/question'); 
        } 
      });
  };


  return (
    <div className='board'>

      <div className="inner">

        <div className="subpage__main">

          <div className="subpage__main__title">
            <h3>문의/고충처리</h3>
            <div style={{display:'flex'}}>
              <div className='postBtnbox'
                style={{marginRight:'10px'}}
                onClick={()=>{
                  navigate('/question'); 
                }}
              >
                <p>목록</p>
              </div>
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
              <div className='textcover'>
                <p>본문</p>
                <p>{propsData.content}</p>
              </div>
              <div className='textcover'>
                <p>회신방법</p>
                <p>{propsData.requestion}</p>
              </div>
            </div>

          
          </div>
          
        </div>
      </div>

    </div>
  )
}



