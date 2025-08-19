import React, { useState, useEffect } from 'react';
import './Header.scss';
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import mainlogo from '../images/mainlogo.png';
import { recoilLoginState } from '../RecoilStore';

const Header: React.FC = () => {
  
  let navigate = useNavigate();
 

  const menus = [
    { title: "시설소개", url:"/greeting", 
      links: [
        {title:"인사말", subUrl:"/greeting"}, 
        {title:"비전과 미션", subUrl:"/mission"}, 
        {title:"제공서비스", subUrl:"/service"}, 
        {title:"시설소개", subUrl:"/notice"}, 
        {title:"오시는길", subUrl:"/map"}, 
      ]
    },
    { title: "갤러리", url:"/programImage",
      links: [
        {title:"프로그램", subUrl:"/programImage"}, 
        {title:"후원물품", subUrl:"/supportImage"}, 
      ]
    },
    { title: "후원/실습", url:"/supporter",
      links: [
        {title:"후원안내", subUrl:"/supporter"}, 
        {title:"자원봉사안내", subUrl:"/volunteer"}, 
        {title:"실습안내", subUrl:"/pratice"}, 
      ]
    },
    { title: "게시판", url:"/board", links: [
      {title:"공지사항", subUrl:"/board"}, 
      {title:"문의/고충처리", subUrl:"/question"}
    ]},
  ];

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<{ [key: number]: boolean }>({});

  const toggleMenu = () => {
      setMenuOpen(!menuOpen);
  };

  const toggleMobileMenu = (index: number) => {
      setMobileMenuOpen((prevState) => ({
          ...prevState,
          [index]: !prevState[index],
      }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10 && window.scrollY < 100) {
        setMenuOpen(false);
      } 
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="header">
      <div className="header-content">
        <div className="inner">
          <div className="container header-content-container">
              <div className="header-logo" 
                onClick={()=>{navigate('/')}}
              >
                <img src={mainlogo}/>
              </div>
              <div className="header-menu">
                {
                  menus.map((item:any, index:any) => (
                    <div className="menu-item" key={index}>
                        <div className="menu-face" 
                          onClick={()=>{
                            navigate(item.url);
                          }}
                        >{item.title}</div>
                        <div className="menu-body">
                          { item.links.length > 0 &&
                            item.links.map((subItem:any, subIndex:any) => (
                              <div className="menu-part" key={subIndex}>
                                <div onClick={()=>{
                                    navigate(subItem.subUrl)
                                  }}>{subItem.title}</div>
                              </div>
                            ))
                          }
                        </div>
                    </div>
                  ))
                }
              </div>
              <div className={`header-hamburger_menu ${menuOpen ? 'header-hamburger_menu--open' : ''}`}>
                  <div className="header-hamburger_icon" onClick={toggleMenu}></div>
                  <div className="header-mobile_menu">
                      <div className="mobile_menu-inner">
                         
                          <div className="mobile_menu-list">
                              {
                                menus.map((item:any, index:any) => (
                                  <div className={`mobile_menu-item ${mobileMenuOpen[index] ? 'mobile_menu-item--open' : ''}`} 
                                    key={index} onClick={() => 
                                      toggleMobileMenu(index)
                                    }>
                                      <div className="mobile_menu-item_inner">
                                          <div className={`mobile_menu-face ${mobileMenuOpen[index] ? 'mobile_menu-face--open' : ''}`}>
                                              <div className="mobile_menu-face_text" 
                                                onClick={()=>{
                                                  navigate(item.url);
                                                  toggleMenu();
                                                }}>{item.title}</div>
                                              <div className="mobile_menu-face_icon"></div>
                                          </div>
                                          <div className="mobile_menu-body">
                                              { item.links.length > 0 &&
                                                item.links.map((subItem:any, subIndex:any) => (
                                                  <div className="mobile_menu-part"
                                                    onClick={()=>{
                                                      navigate(subItem.subUrl);
                                                      toggleMenu();
                                                    }} key={subIndex}
                                                  >
                                                    {subItem.title}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
