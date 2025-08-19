import React from 'react';
import './footer.scss'
import { useNavigate } from 'react-router-dom';
import kakaologo from "../images/login/kakao.png"
import MainURL from '../MainURL';

export default function Footer (props:any) {
  
  let navigate = useNavigate();

  return (
    <footer className='footer'>

      <div className="response-cover">

        <div className="inner">
          
          <ul className='mobile-none'>
            <a href={`${MainURL}/usingpolicy.html`} target='_blank'>
              <li className='link'>이용약관</li>
            </a>
            <div className='divider'></div>
            <a href={`${MainURL}/personalinfo.html`} target='_blank'>
              <li className='link'>개인정보처리방침</li>
            </a>
            <div className='divider'></div>
            <div 
              onClick={()=>{
                navigate('/admin')
              }}
            >
              <li className='link'>관리자</li>
            </div>
          </ul>

          <ul>
            <li className='text black'>새삶공동체</li>
            <li className='text black'>대표자: 최재영</li>
            <li className='text'>고유번호: 123-82-85050</li>
          </ul>

          <ul>
            <a href='tel:031-254-2110'>
              <li className='text'>문의: 031-254-2110</li>
            </a>
            <li className='text'>주소 : 경기도 수원시 장안구 송죽동 73(경수대로994번길 49) 현광프라자 401호</li>
          </ul>

          <ul className='copyright'>
            <li className='text'>COPYRIGHT</li>
            <li className='text black'>© 2025. 새삶공동체.</li>
            <li className='text'>All rights reserved.</li>
          </ul>

        </div>
      </div>
    </footer>
      
  );
}

 

