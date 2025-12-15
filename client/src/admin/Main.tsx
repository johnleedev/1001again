import './Admin.scss'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Routes, Route, useNavigate } from 'react-router-dom';

export default function Main( props: any) {
  
  const navigate = useNavigate();
  
  return (
    <div className="AdminContainer">
    
      <div className='AdminContent adminMain'>
        <div className='amdin_Main_Box' onClick={()=>{ navigate(`/admin/edit/main-info`) }}>
          메인 정보 수정
        </div>
        <div className='amdin_Main_Box' onClick={()=>{ navigate(`/admin/edit/gallery`) }}>
          갤러리 수정
        </div>
        <div className='amdin_Main_Box' onClick={()=>{ navigate(`/admin/edit/support-practice`) }}>
          후원/실습 수정
        </div>
      </div>

      
        

      {/* footer */}
      <section className="footer">
      <div className="inner">
          <Footer></Footer>
      </div>
      </section>
    </div>
  );
}
