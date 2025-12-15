import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import './Main.scss'
import axios from 'axios';
import MainURL from '../../MainURL';
import { format } from "date-fns";
import { useRecoilValue } from 'recoil';
import { recoilLoginState, recoilUserData } from '../../RecoilStore';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { FaArrowRight } from "react-icons/fa";
import { FaHandsHelping } from "react-icons/fa";
import { RiAdvertisementLine } from "react-icons/ri";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import { GrGallery } from "react-icons/gr";
import DateFormmating from '../../components/DateFormmating';
import { motion } from "framer-motion";

interface ListProps {
  id : number;
  sort : string;
  title : string;
  content : string;
  userAccount : string;
  userNickName : string;
  isLiked : string;
  date : string;
  views : string;
  images : [string]
}


export default function Main(props:any) {

	let navigate = useNavigate();
  const isLogin = useRecoilValue(recoilLoginState);
	const userData = useRecoilValue(recoilUserData);


  const [list, setList] = useState<ListProps[]>([]);
  const fetchDatas = async () => {
    const res = await axios.get(`${MainURL}/board/getposts/1`);
    if (res.data) {
      const copy = res.data.resultData;
      setList(copy);
    }
  }

  useEffect(()=>{
    fetchDatas();
  }, []);

  interface GalleryItem {
    subtitle : string, 
    date : string;
    image : string;
  }
 

  const [program, setProgram] = useState<GalleryItem[]>([]);
  const [support, setSupport] = useState<GalleryItem[]>([]);

  // 게시글 가져오기
  const fetchPosts = async () => {
    try {
      const progRes = await axios.get(`${MainURL}/main/getgalleryprogram`);
      if (progRes.data && Array.isArray(progRes.data)) {
        setProgram(progRes.data);
      } else {
        setProgram([]);
      }
      const supRes = await axios.get(`${MainURL}/main/getgallerysupport`);
      if (supRes.data && Array.isArray(supRes.data)) {
        setSupport(supRes.data);
      } else {
        setSupport([]);
      }
    } catch (e) {
      console.error('메인 갤러리 로드 오류:', e);
      setProgram([]);
      setSupport([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);   


  // 글자수 제한
  const renderPreview = (content : string) => {
    if (content?.length > 40) {
      return content.substring(0, 40) + '...';
    }
    return content;
  };

	return (
		<div className='main'>

      <div className="main__box1">
				<div className="inner">
         
          <div className="main_top_container">
						<p className="main__box-slogan">
              <span className="slogan-text">"당신의 자립과 회복을 응원합니다"</span>
						</p>
					</div>
     	</div>	
  		</div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
			<div className="main__box2">
				<div className="inner">
         
          <div className="main_bottom_cover">
            <div className="main_bottom_box"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate('/notice');
              }}
            >
              <div className="main_left_icon">
                <HiOutlineBuildingLibrary />
              </div>
              <div className="main_middle_text">
                <h1>센터소개</h1>
                <p>새삶공동체를 </p>
                <p>소개합니다.</p>
              </div>
              <div className="main_right_link">
                <FaArrowRight />
              </div>
            </div>
            <div className="main_bottom_box"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate('/programImage');
              }}
            >
              <div className="main_left_icon">
                <GrGallery />
              </div>
              <div className="main_middle_text">
                <h1>갤러리</h1>
                <p>행사 및 후원에 관한</p>
                <p>사진들을 살펴보세요.</p>
              </div>
              <div className="main_right_link">
                <FaArrowRight />
              </div>
            </div>
            <div className="main_bottom_box"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate('/supporter');
              }}
            >
              <div className="main_left_icon">
                <FaHandsHelping/>
              </div>
              <div className="main_middle_text">
                <h1>후원 및 실습</h1>
                <p>후원 및 실습에 관한</p>
                <p>정보를 살펴보세요.</p>
              </div>
              <div className="main_right_link">
                <FaArrowRight />
              </div>
            </div>
          </div>
          
				</div>	
  		</div> 
      </motion.div>

      {/* <div className="swiper-cover">
        <div className="main_banner_swiper">
          
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={0}
            slidesPerView={5}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            navigation
            className="swiperimagerow desktop"
          >
            { program.length > 0 &&
              program.map((item:any, index:any)=>{
               
                return ( 
                  <SwiperSlide className="slide" key={index}
                    onClick={()=>{
                      window.scrollTo(0, 0);
                      navigate(`/gallery`);
                    }}
                  >
                    <div className="place__img--cover">
                      <div className='imageBox'>
                        <img src={`${MainURL}/images/gallery/${item.image}`} alt={'등록된 사진이 없습니다.'} />
                      </div>
                    </div>
                  </SwiperSlide>
                )
              })
            } 
          </Swiper>

          <div className="swiperimagerow mobile">
          { program.length > 0 &&
            program.slice(0,6).map((item:any, index:any)=>{
              
              return ( 
                <div className="slide" key={index}
                  onClick={()=>{
                    window.scrollTo(0, 0);
                    navigate(`/gallery`);
                  }}
                >
                  <div className="place__img--cover">
                    <div className='imageBox'>
                      <img src={`${MainURL}/images/gallery/${item.image}`} alt={'등록된 사진이 없습니다.'} />
                    </div>
                  </div>
                </div>
              )
            })
          } 
          </div>
        </div>
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div className="swiper-cover">
        <div className="main_banner_swiper">
          <div className="main_banner_title">
            <h3>후원현황</h3>
            <div className="link_btn"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate(`/supportImage`);
              }}
            >
              <p>자세히보기</p>
            </div>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={0}
            slidesPerView={3}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            className="swiperimagerow desktop"
          >
            { support.length > 0 &&
              support.map((item:any, index:any)=>{
               
                return ( 
                  <SwiperSlide className="slide" key={index}
                    onClick={()=>{
                      window.scrollTo(0, 0);
                      navigate(`/supportImage`);
                    }}
                  >
                    <div className="place__img--cover">
                      <div className='imageBox'>
                        <img src={`${MainURL}/images/gallery/${item.image}`} alt={'등록된 사진이 없습니다.'} />
                      </div>
                    </div>
                    <div className="place__text">
                      <p>{item.subtitle}</p>
                    </div>
                  </SwiperSlide>
                )
              })
            } 
          </Swiper>

          <div className="swiperimagerow mobile">
          { support.length > 0 &&
            support.slice(0,6).map((item:any, index:any)=>{
              
              return ( 
                <div className="slide" key={index}
                  onClick={()=>{
                    window.scrollTo(0, 0);
                    navigate(`/gallery`);
                  }}
                >
                  <div className="place__img--cover">
                    <div className='imageBox'>
                      <img src={`${MainURL}/images/gallery/${item.image}`} alt={'등록된 사진이 없습니다.'} />
                    </div>
                    <div className="place__text">
                      <p>{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              )
            })
          } 
          </div>
        </div>
      </div>
      </motion.div>

      <div style={{height:'100px'}}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
      <div className="swiper-cover">
        <div className="main_banner_swiper">
          <div className="main_banner_title">
            <h3>공지사항</h3>
            <div className="link_btn"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate(`/board`);
              }}
            >
              <p>자세히보기</p>
            </div>
          </div>
          <div className="board_cover">
          {
            list.length > 0 
            ?
            list.map((item:any, index:any)=>{

              return(
                <ul className="textRow" key={index}
                  onClick={()=>{
                    window.scrollTo(0, 0);
                    navigate('/boarddetail', {state : item});  
                  }}
                >
                  <li className="td_num">
                    <div className="titlebox">
                      <p>공지사항</p>
                    </div>
                  </li>
                  <li className="td_title">{renderPreview(item.title)}</li>
                  <li className="td_date">{DateFormmating(item.date)}</li>
                  <li className="td_views">{item.userNickName}</li>
                </ul>
              )
            })
            :
            <ul className="textRow">
              <li className="td_num"></li>
              <li className="td_title"><p>작성된 글이 없습니다.</p></li>
              <li className="td_name"></li>
              <li className="td_date"></li>
              <li className="td_views"></li>
            </ul>
          }
          </div>
          
        </div>
      </div>
      </motion.div>

      <div style={{height:'100px'}}></div>
           
			<Footer />

		</div>
	);
}
