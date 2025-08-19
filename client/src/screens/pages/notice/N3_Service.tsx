import '../Common.scss';
import MainURL from '../../../MainURL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { motion } from "framer-motion";

export default function N3_Service(props:any) {

  const [mainServiceData, setMainServiceData] = useState<{title:string, content:string, image:string}[]>([]);

  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`)
    if (res.data) {
      const copy = {...res.data[0]}
      setMainServiceData(JSON.parse(copy.mainService));
    } 
  };

  useEffect(() => {
    fetchPosts();
  }, []);  
  

  return (
    <div className='notice-cover'>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div className="homepage_detail_titlebox">
        <p className="homepage_detail_title">제공 서비스</p>
      </div>
      
      <div className="service-cover">
        <div className="service-content-cover">
          <div className="service-content-cover">
          {
            mainServiceData.map((subItem:any, subIndex:any)=>{

              return (
              <div className="service-content-box" key={subIndex}>
                <div className="service-content-imagebox">
                  <img src={`${MainURL}/images/notice/${subItem.image}`} alt='profileImage'/>
                </div>
                <div className="service-content-textbox">
                  <div className="service-content-serviceName">{subItem.title}</div>
                  {
                    subItem.content.map((subText:any, textIndex:any)=>(
                      <div className="service-content-serviceContent" key={textIndex}>{subText}</div>
                    ))
                  }
                </div>
              </div>
              )
            })
          }
          </div>
        </div>
      </div>  
      </motion.div>
      <Footer />

    </div>
  )
}



