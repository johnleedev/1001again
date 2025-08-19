import React, { useCallback, useEffect, useState } from 'react';
import '../Common.scss';
import MainURL from '../../../MainURL';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import { useDropzone } from 'react-dropzone'
import imageCompression from "browser-image-compression";
import Loading from '../../../components/Loading';
import { CiCircleMinus } from "react-icons/ci";
import { format } from "date-fns";
import { useRecoilState, useRecoilValue } from 'recoil';
import { recoilUserData } from '../../../RecoilStore';


export default function QuestionPost () {

  let navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [requestion, setRequestion] = useState('');

  // 글쓰기 등록 함수 ----------------------------------------------
  const currentDate = new Date();
  const datecopy = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss");
  const registerPost = async () => {
    const getParams = {
      title : title,
      content: content,
      requestion : requestion,
      date : datecopy,
    }
    axios 
      .post(`${MainURL}/board/postsquestion`, getParams)
      .then((res) => {
        if (res.data) {
          alert('작성 되었습니다.')
          navigate(-1);
        }
      })
      .catch(() => {
        console.log('실패함')
      })
  };


  return (
    <div className='board'>

      <div className="inner">

        <div className="subpage__main">
          <div className="subpage__main__title">
            <h3>문의/고충처리 글쓰기</h3>
            <div className='postBtnbox'
              style={{marginRight:'10px'}}
              onClick={()=>{navigate(-1);}}
            >
              <p>목록</p>
            </div>
          </div>
          
          <div className="subpage__main__content">

            <div className="userBox">
              <FaPen color='#334968' />
              <p>익명</p>
            </div>
            <div className="addPostBox">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'end',}}>
                <p>제목</p>
                <h5 style={{fontSize:'12px'}}>* 최대 200자</h5>
              </div>
              <input value={title} className="inputdefault" type="text" 
                maxLength={200}
                onChange={(e) => {setTitle(e.target.value)}}/>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginTop:'20px'}}>
                <p>본문</p>
                <h5 style={{fontSize:'12px'}}>* 최대 2000자</h5>
              </div>
              <textarea 
                className="textarea textareapost"
                value={content}
                maxLength={2000}
                onChange={(e)=>{setContent(e.target.value)}}
              />
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'end', marginTop:'20px'}}>
                <p>회신요청방법</p>
                <h5 style={{fontSize:'12px'}}>* 최대 200자</h5>
              </div>
              <input value={requestion} className="inputdefault" type="text" 
                maxLength={200}
                onChange={(e) => {setRequestion(e.target.value)}}/>
            </div>
            

            <div style={{width:'100%', height:'2px', backgroundColor:'#EAEAEA', margin:'10px 0'}}></div>

            <div className="buttonbox">
              <div className="button"
              onClick={()=>{
                registerPost();
              }}
              >
                <p>작성 완료</p>
              </div>
            </div>

           </div>

           

          
        </div>
      </div>

      <Footer />
    </div>
  )
}



