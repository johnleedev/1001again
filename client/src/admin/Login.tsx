import React, { useEffect, useState } from 'react';
import './Admin.scss'
import axios from 'axios';
import MainURL from '../MainURL';
import { FaCheck } from "react-icons/fa";
import { CiWarning } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { recoilLoginState, recoilUserData } from '../RecoilStore';

export default function Login () {

  let navigate = useNavigate();
  const setIsLogin = useSetRecoilState(recoilLoginState);
  const setUserData = useSetRecoilState(recoilUserData);
  
  const [refresh, setRefresh] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState(1);
  const [userId, setUserId] = useState('');
  const [userPasswd, setUserPasswd] = useState('');

  const [logisterName, setLogisterName] = useState('');
  const [logisterId, setLogisterId] = useState('');
  const [logisterPasswd, setLogisterPasswd] = useState('');
  const [logisterPasswdCheck, setLogisterPasswdCheck] = useState('');

  const handleLogin = async () => {
    await axios
      .post(`${MainURL}/adminlogin/loginadmin`, {
        userId : userId,
        passwd : userPasswd
      })
      .then((res)=>{
        if (res.data.success) {
          if (res.data.auth === 'true') {
            alert('로그인 되었습니다.');
            setIsLogin(true);
            setUserData({
              userId: res.data.userId,
              userName : res.data.name
            })
            setRefresh(!refresh);
            navigate('/admin/main');
          } else {
            alert('관리자 로그인 승인이 필요합니다.');
          }
        } else {
         if (res.data.which === 'id') {
           alert('없는 아이디입니다.');  
         }
         if (res.data.which === 'passwd') {
           alert('비밀번호가 정확하지 않습니다.');
         }
        }
      })
      .catch((err)=>{
        alert('다시 시도해주세요.')
      })
   };
 
  const handleLogister = async () => {
   await axios
    .post(`${MainURL}/adminlogin/logisteradmin`, {
      name : logisterName,
      userId : logisterId,
      passwd : logisterPasswd      
    })
    .then((res)=>{
      if (res.data) {
        alert('가입이 완료되었습니다.');
        setCurrentTab(1);
      }
    })
    .catch((err)=>{
      alert('다시 시도해주세요.')
    })
  };

  return (
    <div className='MainAdmin'>

      <div className="inner">

        { currentTab === 1 &&
          <div className="loginBox">
            <div className="inputbox">
              <p style={{marginBottom:'10px'}}>아이디</p>
              <input value={userId} className="inputdefault addInput" type="text" 
                onChange={(e) => {setUserId(e.target.value)}}
                onKeyDown={(e)=>{if (e.key === 'Enter') {handleLogin();}}}/>
            </div>
            <div className="inputbox">
              <p style={{marginBottom:'10px'}}>비밀번호</p>
              <input value={userPasswd} className="inputdefault addInput" type="password" 
                onChange={(e) => {setUserPasswd(e.target.value)}}
                onKeyDown={(e)=>{if (e.key === 'Enter') {handleLogin();}}}/>
            </div>
            <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
              <div className='btn-row' 
                onClick={()=>{setCurrentTab(2)}}
              >
                <p>회원가입</p>
              </div>
              <div className='btn-row' 
                onClick={handleLogin}
              >
                <p>로그인</p>
              </div>
            </div>
          </div>
        }
        

        { currentTab === 2 &&
          <div className="loginBox">
            <div className="inputbox">
              <p>이름</p>
              <input value={logisterName} className="inputdefault addInput" type="text" 
                onChange={(e) => {setLogisterName(e.target.value)}}/>
            </div>
            <div className="inputbox">
              <p>아이디</p>
              <input value={logisterId} className="inputdefault addInput" type="text" 
                onChange={(e) => {setLogisterId(e.target.value)}}/>
            </div>
            <div className="inputbox">
              <p>비밀번호</p>
              <input value={logisterPasswd} className="inputdefault addInput" type="password" 
                onChange={(e) => {setLogisterPasswd(e.target.value)}}/>
            </div>
            <div className="inputbox">
              <div style={{display:'flex', alignItems:'center'}}>
                <p style={{marginRight:'10px'}}>비밀번호확인</p>
                {
                  (logisterPasswd !== '' && logisterPasswdCheck !== '')
                  &&
                  <>
                  {
                    logisterPasswd === logisterPasswdCheck
                    ? <FaCheck color='#1DDB16'/>
                    : <CiWarning color='#FF0000'/>
                  }
                  </>
                }
              </div>
              <input value={logisterPasswdCheck} className="inputdefault addInput" type="password" 
                onChange={(e) => {setLogisterPasswdCheck(e.target.value)}}/>
            </div>
            <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
              <div className='btn-row' 
                onClick={()=>{setCurrentTab(1)}}>
                <p>이전</p>
              </div>
              <div className='btn-row' 
                onClick={()=>{
                  if (logisterId === '' || logisterName === '' || logisterPasswd === '') {
                    alert('빈칸을 채워주세요')
                  } else {
                    if (logisterPasswd !== logisterPasswdCheck) {
                      alert('비밀번호가 일치하지 않습니다.')
                    } else {
                      handleLogister();
                    }
                  }
                }}
              >
                <p>가입완료</p>
              </div>
            </div>
          </div> 
        }

        {/* { currentTab === 3 &&
          <div className="loginBox" style={{textAlign:'center'}}>
            <div className="inputbox">
              <p>{sessionedUserName}님</p>
              <p>환영합니다.</p>
            </div>
            <p>현재 로그인 상태입니다.</p>
          </div> 
        } */}
        
      </div>
     
    </div>
  );
}

