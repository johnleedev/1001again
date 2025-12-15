import '../Common.scss';
import { useEffect, useState } from 'react';
import MainURL from '../../../MainURL';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { motion } from "framer-motion";

interface GalleryProps {
  title : string, 
  date : string;
  images : string[];
}

export default function G1_ProgramImage (props:any) {
 
  const [program, setProgram] = useState<any[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${MainURL}/main/getgalleryprogram`)
      if (res.data && Array.isArray(res.data)) {
        setProgram(res.data);
      } else {
        setProgram([]);
      }
    } catch (error) {
      console.error('프로그램 갤러리 조회 오류:', error);
      setProgram([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);  

  return (
    <div className="program-cover">

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div>
        <div className="homepage_detail_titlebox">
          <p className="homepage_detail_title">프로그램</p>
        </div>

        <div className="program-box">
          {  
            program && program.length > 0
            ?
            program.map((item:any, index:any)=>{
              return (
                <div className="program-content" key={index}>
                  <div className="program-content-imagebox">
                    <div className="program-content-image">
                      <img src={`${MainURL}/images/gallery/${item.image}`} alt='profileImage'/>
                    </div>
                  </div>
                  <div className="program-content-textbox">
                    <div className="program-content-programName">{item.subtitle}</div>
                    <div className="program-content-notice">{item.date}</div>
                  </div>
                </div>
              )
            })
            :
            <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
              등록된 프로그램이 없습니다.
            </div>
          }
        </div>   
      </div>
      </motion.div>
      <Footer />
    </div> 
  )
}



