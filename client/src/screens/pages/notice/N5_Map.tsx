import '../Common.scss';
import React, { useEffect, useRef, useState } from 'react';
import kakaologo from "../../../images/login/kakao.png"
import naverlogo from "../../../images/login/naver.png"
import { IoIosArrowForward } from "react-icons/io";
import MainURL from '../../../MainURL';
import axios from 'axios';
import Footer from '../../../components/Footer';
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
  navermapimage:string;
  placeNaver: string;
  placeKakao: string;
}


export default function N5_Map (props:any) {

  const [mainData, setMainData] = useState<MainDataProps>();

  const fetchPosts = async () => {
    const res = await axios.get(`${MainURL}/main/getmaininfo`);
    if (res.data) {
      const copy = { ...res.data[0] };
      setMainData(copy);
      addressAPI(); 
    }
  };
  


  useEffect(() => {
    if (document.getElementById('naver-map-script')) {
      fetchPosts();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=hp82bwpwse';
    script.async = true;
    script.onload = () => {
      fetchPosts(); // 스크립트가 완전히 로드된 후 addressAPI 실행
    };
    document.head.appendChild(script);
  }, []);
  
  
  // 네이버 지도 구현하기
  const mapElement = useRef<HTMLDivElement | null>(null);
  const { naver } = window;
  const addressAPI = async () => {
    var map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(37.30785, 127.0045),
      zoom: 16
    });
    
    mapElement.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(37.30785, 127.0045),
        map: map
    });
  };


  return (
    <div className='notice-cover'>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div className="homepage_detail_titlebox">
        <p className="homepage_detail_title">오시는길</p>
      </div>

      <div className='noticebox-mapBox'>
        
        <div className='noticebox-maptitle'>
          <div className="noticebox-maptitle-right">
            <div className="noticebox-maptitle-right-text">
              <div className='noticebox-maptitle-right-text-title' >{mainData?.name}</div>
              <div className="noticebox-maptitle-divider-vertical for-pc"></div>  
              <div className='noticebox-maptitle-right-text-sub'>{mainData?.address}</div>
            </div>
          </div>
        </div>

        <a className="maparea" href={`${mainData?.placeNaver}`} target='_blank'>
          <div id="map" ref={mapElement} style={{ minHeight: '600px'}} />
        </a>
        
        <div className="noticebox-mapBtnBox section">
          <a className="noticebox-mapBtn"
            href={`${mainData?.placeNaver}`} target='_blank'>
            <div className="noticebox-mapBtnImg">
              <img src={naverlogo}/>
            </div>
            <p className='noticebox-map-text'>네이버 지도</p>
            <IoIosArrowForward className='noticebox-map-icon'/>
          </a>
          <a  className="noticebox-mapBtn"
            href={`${mainData?.placeKakao}`} target='_blank'>
            <div className="noticebox-mapBtnImg">
              <img src={kakaologo}/>
            </div>
            <p className='noticebox-map-text'>카카오 지도</p>
            <IoIosArrowForward className='noticebox-map-icon'/>
          </a>
        </div>
      </div>
      </motion.div>
      
      <Footer />

    </div>
  )
}



