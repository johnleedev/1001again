import '../Common.scss';
import MainURL from '../../../MainURL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../../components/Footer';

import { motion } from "framer-motion";

export default function RehabilitateNotice(props:any) {

  const [greetingData, setGreetingData] = useState<{image:string, fromname:string, content:string[]}>();
  
  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getrehabilitate`)
    if (res.data) {
      const copy = {...res.data[0]}
      console.log(copy);
      setGreetingData(JSON.parse(copy.rehabilitate));
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
        <p className="homepage_detail_title">자활사업단</p>
      </div>

      <div className="greetingBox">
        <div className="greetingbox-sub-image">
          <div className="greeting-image">
            <img src={`${MainURL}/images/rehabilitate/${greetingData?.image}`}/>
          </div>
        </div>
        <div className="greeting-content-cover">
          <div className="greeting_content_row">
            {  
              greetingData?.content.map((item:any, index:any)=>{
                return (
                    <p key={index}  className="greeting_content_text">{item}</p>
                )
              })
            }
          </div>
          <div className="greeting_content_fromName">
            <p>{greetingData?.fromname}</p>
          </div>
        </div>
      </div>
      </motion.div>

      <Footer />

    </div>
  )
}



