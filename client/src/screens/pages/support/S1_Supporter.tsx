import '../Common.scss';
import { useEffect, useState } from 'react';
import MainURL from '../../../MainURL';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { motion } from "framer-motion";

interface PracticeProps {
  title : string, 
  date : string;
  content : string;
}

export default function S1_Supporter (props:any) {

  const [practiceData, setPracticeData] = useState<PracticeProps[]>([]);

  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getpractice`)
    if (res.data) {
      const copy = [...res.data];
      const result = copy.filter((e:any)=> e.title === '포스터' || e.title === '후원안내');
      setPracticeData(result);
    } 
  };

  useEffect(() => {
    fetchPosts();
  }, []);  
 
  return (
    <div className="support-cover">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      {
        practiceData?.map((item:any, index:any)=>{

          const contentCopy = item.contentSort === 'onlyimage' ? item.content : JSON.parse(item.content);

          if (item.contentSort === 'text') {

            return ( 
              <div key={index}>
                
                <div className="homepage_detail_titlebox">
                  <p className="homepage_detail_title">{item.title}</p>
                </div>
  
                <div className="supportbox">
                  <div className="support-cover_institution section">
                    <div className="support-cover-content-cover">
                      <div className="support-content-supportbox">
                          {
                            contentCopy.map((SubItem:any, SubIndex:any)=>{
                              return (
                                <div key={SubIndex} className="institution_mainsupport">
                                  <p className="institution_mainsupport_title">{SubItem.title}</p>
                                  {
                                    SubItem.content.map((detilaItem:any, detilaIndex:any)=>{
                                      return (
                                        <div key={detilaIndex} className="institution_mainsupport_content">
                                          <p className="institution_mainsupport_content_text">- {detilaItem}</p>
                                        </div>
                                      )
                                    })
                                  }
                                </div>
                              )
                            })
                            
                          }
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          } else if (item.contentSort === 'onlyimage') {

            return (
              <div className="only-images-box" key={index}>
                <div className="images-content-image">
                  <img src={`${MainURL}/images/mainimages/${contentCopy}`} alt='profileImage'/>
                </div>
              </div>   
            )
          } 
        })
      }
      </motion.div>
      <Footer />
      
    </div> 
  )
}



