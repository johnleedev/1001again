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
 
  const [program, setProgram] = useState<GalleryProps[]>([]);

  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getgallery`)
    if (res.data) {
      const copy = [...res.data]
      const result = copy.map((item:any) => ({
        ...item,
        images: JSON.parse(item.images)
      }));
      const resultCopy = result.filter((e:any)=> e.title === '프로그램');
      setProgram(resultCopy);
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
      {  
        program?.map((item:any, index:any)=>{

          return (
            <div key={index}>
              <div className="homepage_detail_titlebox">
                <p className="homepage_detail_title">{item.title}</p>
              </div>

              <div className="program-box">
              {  
                item.images.map((subItem:any, subIndex:any)=>{

                  return (
                    <div className="program-content" key={subIndex}>
                      <div className="program-content-imagebox">
                        <div className="program-content-image">
                          <img src={`${MainURL}/images/gallery/${subItem.image}`} alt='profileImage'/>
                        </div>
                      </div>
                      <div className="program-content-textbox">
                        <div className="program-content-programName">{subItem.subtitle}</div>
                        <div className="program-content-notice">{subItem.date}</div>
                      </div>
                    </div>
                  )
                })
              }
              </div>   
            </div>   
          )
        })
      }
      </motion.div>
      <Footer />
    </div> 
  )
}



