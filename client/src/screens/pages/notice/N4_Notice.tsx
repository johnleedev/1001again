import '../Common.scss';
import naverbloglogo from "../../../images/naverblog.png"
import facebooklogo from "../../../images/facebook.png"
import { FiPhone } from "react-icons/fi";
import MainURL from '../../../MainURL';
import { IoIosPersonAdd } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { FaHandsHelping } from "react-icons/fa";
import { IoShareSocialSharp } from "react-icons/io5"
import { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../../../components/Footer';
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { motion } from "framer-motion";

interface MainDataProps {
  id: string;
  name: string;
  charger: string;
  address: string;
  youtube: string;
  blog: string;
  facebook: string;
  quiry: string;
  supportAccount: string;
  imageMainName: string;
  imageText: string;
  mainLogo: string;
  mainLogoMini: string;
  mainMessage: string;
  mainService: string;
  facility: string;
  placeNaver: string;
  placeKakao: string;
}


export default function N4_Notice(props:any) {

  const [mainData, setMainData] = useState<MainDataProps>();
  const [facilityData, setFacilityData] = useState<{title:string, image:string}[]>([]);

  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`)
    if (res.data) {
      const copy = {...res.data[0]}
      setMainData(copy);
      setFacilityData(JSON.parse(copy.facility));
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
        <p className="homepage_detail_title">시설 소개</p>
      </div>
      
      <div className="facility-cover">
        <div className="facility-content-cover">
            <div className="facility-content-cover">
            {
              facilityData.map((subItem:any, subIndex:any)=>{

                return (
                <div className="facility-content-box" key={subIndex}>
                  <div className="facility-content-imagebox">
                    <img src={`${MainURL}/images/notice/${subItem.image}`} alt='profileImage'/>
                  </div>
                  <div className="facility-content-textbox">
                    <div className="facility-content-facilityName">{subItem.title}</div>
                  </div>
                </div>
                )
              })
            }
            </div>
          </div>
      </div>  
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div className='noticebox-sub'>
        <ul className="noticebox-sub-info">
          <li className="notice-list">
            <div className='notice-title'>
              <HiOutlineBuildingLibrary className='notice-title-icon'/>
              <p className='notice-title-text'>이름</p>
            </div>
            <p className='notice-bar'></p>
            <p className='notice-content notice-content-check'>{mainData?.name}</p>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <IoIosPersonAdd className='notice-title-icon'/>
              <p className='notice-title-text'>센터장</p>
            </div>
            <p className='notice-bar'></p>
            <p className='notice-content notice-content-check'>{mainData?.charger}</p>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <FaLocationDot className='notice-title-icon'/>
              <p className='notice-title-text'>주소</p>
            </div>
            <p className='notice-bar'></p>
            <p className='notice-content'>{mainData?.address}</p>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <FaHandsHelping className='notice-title-icon'/>
              <p className='notice-title-text'>후원계좌</p>
            </div>
            <p className='notice-bar'></p>
            <p className='notice-content'>{mainData?.supportAccount}</p>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <div className='notice-title-icon'>
                <img src={facebooklogo} />
              </div>
              <p className='notice-title-text'>유튜브</p>
            </div>
            <p className='notice-bar'></p>
            <a href={mainData?.youtube} className='notice-content' 
              style={{textDecoration:'underline', fontWeight:'normal'}} target='_blank'
            >{mainData?.name} 유투브 채널</a>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <FiPhone className='notice-title-icon'/>
              <p className='notice-title-text'>문의</p>
            </div>
            <p className='notice-bar'></p>
            <a href={`tel:${mainData?.quiry}`} className='notice-content' 
              style={{textDecoration:'underline', fontWeight:'normal'}}
            >{mainData?.quiry}</a>
          </li>
          <li className="notice-list">
            <div className='notice-title'>
              <IoShareSocialSharp className='notice-title-icon'/>
              <p className='notice-title-text'>SNS</p>
            </div>
            <p className='notice-bar'></p>
            <div className="notice-content">
            {
              (mainData?.blog !== '' && mainData?.blog !== null) &&
                <a href={mainData?.blog} className='notice-content-icon' 
                  style={{textDecoration:'underline', fontWeight:'normal'}} target='_blank'
                >  <img src={naverbloglogo} /></a>
            }
            {
              (mainData?.facebook !== '' && mainData?.facebook !== null) &&  
              <a href={mainData?.facebook} className='notice-content-icon' 
                style={{textDecoration:'underline', fontWeight:'normal'}} target='_blank'
              ><img src={facebooklogo}/></a>
            }
            </div>
          </li>
        </ul>
      </div>
      </motion.div>

      <Footer />

    </div>
  )
}



