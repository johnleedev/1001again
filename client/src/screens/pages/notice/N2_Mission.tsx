import '../Common.scss';
import MainURL from '../../../MainURL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { motion } from "framer-motion";
import { RiHeartAdd2Line } from "react-icons/ri";
import { PiHandHeartBold } from "react-icons/pi";
import { BsPersonHearts } from "react-icons/bs";
import { BsPlus } from "react-icons/bs";
import { TiPlus, TiEquals } from "react-icons/ti";

export default function N2_Mission(props:any) {

  const [messageData, setMessageData] = useState<{title:string, content:string}[]>([]);
 
  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`)
    if (res.data) {
      const copy = {...res.data[0]}
      setMessageData(JSON.parse(copy.mainMessage));
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
        <p className="homepage_detail_title">비전과 미션</p>
      </div>

      <div className="messagebox">
        <div className="icon-content">
          <div className="icon-content-box">
            <RiHeartAdd2Line className='icon-content-icon'/>
            <p>회복</p>
          </div>
          <div className="icon-plus-box">
            <TiPlus className='icon-plus-icon'/>
          </div>
          <div className="icon-content-box">
            <PiHandHeartBold className='icon-content-icon'/>
            <p>희망</p>
          </div>
          <div className="icon-plus-box">
            <TiEquals className='icon-plus-icon'/>
          </div>
          <div className="icon-content-box">
            <BsPersonHearts className='icon-content-icon'/>
            <p>자립</p>
          </div>
        </div>
      </div>

      {/* <div className="messagebox">
        <div className="message-cover_institution section">
          <div className="message-cover-content-cover">
            <div className="message-content-messagebox">
              {
                messageData.map((item:any, index:any)=>{
                  return (
                    <div key={index} className="institution_mainMessage">
                      <p className="institution_mainMessage_title">{item.title}</p>
                      {
                        item.content.map((subItem:any, subIndex:any)=>{
                          return (
                            <div key={subIndex} className="institution_mainMessage_content">
                              <p className="institution_mainMessage_content_text">{subItem}</p>
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
      </div> */}

      


      </motion.div>
      <Footer />

    </div>
  )
}



