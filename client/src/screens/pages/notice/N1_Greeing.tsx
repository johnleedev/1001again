import '../Common.scss';
import MainURL from '../../../MainURL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../../components/Footer';
import mainlogo from '../../../images/logomini.jpg';
import { motion } from "framer-motion";

export default function N1_Greeting(props:any) {

  const [greetingData, setGreetingData] = useState<{image:string, fromname:string, content:string[]}>();
  
  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`)
    if (res.data) {
      const copy = {...res.data[0]}
      setGreetingData(JSON.parse(copy.greeting));
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
        <p className="homepage_detail_title">인사말</p>
      </div>

      <div className="greetingBox">
        <div className="greetingbox-sub-image">
          <div className="greeting-image">
            <img src={mainlogo}/>
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



