import React, { useEffect, useState } from 'react';
import MainURL from '../../../MainURL';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye, MdOutlineAccessTime } from "react-icons/md";
import DateFormmating from '../../../components/DateFormmating';
import { useRecoilValue } from 'recoil';
import { recoilLoginState, recoilUserData } from '../../../RecoilStore';



export default function BoardDetail (props:any) {

  const ID = props.ID;
  let navigate = useNavigate();
  const location = useLocation();
  const propsData = location.state;
  const isLogin = useRecoilValue(recoilLoginState);
  const userData = useRecoilValue(recoilUserData);
  
  const images = location.state.images ? JSON.parse(location.state.images) : [];

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
              <div className='textcover'>
                <p>{propsData.content}</p>
              </div>

            </div>

          
          </div>
          
        </div>
      </div>

    </div>
  )
}



