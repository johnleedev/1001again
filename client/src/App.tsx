import './App.scss';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Main from './screens/main/Main';
import { RecoilRoot } from 'recoil';
import Header from './components/Header';
import N1_Greeting from './screens/pages/notice/N1_Greeing';
import N2_Mission from './screens/pages/notice/N2_Mission';
import N3_Service from './screens/pages/notice/N3_Service';
import N4_Notice from './screens/pages/notice/N4_Notice';
import N5_Map from './screens/pages/notice/N5_Map';
import G1_ProgramImage from './screens/pages/gallery/G1_ProgramImage';
import G2_SupportImage from './screens/pages/gallery/G2_SupportImage';
import S1_Supporter from './screens/pages/support/S1_Supporter';
import S2_Volunteer from './screens/pages/support/S2_Volunteer';
import S3_Pratice from './screens/pages/support/S3_Pratice';
import Board from './screens/pages/board/Board';
import BoardPost from './screens/pages/board/BoardPost';
import BoardDetail from './screens/pages/board/BoardDetail';
import AdminMain from './admin/AdminMain';
import Question from './screens/pages/question/Question';
import QuestionPost from './screens/pages/question/QuestionPost';
import QuestionDetail from './screens/pages/question/QuestionDetail';
import RehabilitateNotice from './screens/pages/rehabilitate/RehabilitateNotice';

function App() {

  return (
      <div className="App">
        <RecoilRoot>

          <Header/>
          
          <div className='Main'>
            <Routes>
              <Route path="/" element={<Main/>}/>
              <Route path="/greeting" element={<N1_Greeting/>}/>
              <Route path="/mission" element={<N2_Mission/>}/>
              <Route path="/service" element={<N3_Service/>}/>
              <Route path="/notice" element={<N4_Notice/>}/>
              <Route path="/map" element={<N5_Map/>}/>
              <Route path="/programImage" element={<G1_ProgramImage/>}/>
              <Route path="/supportImage" element={<G2_SupportImage/>}/>
              <Route path="/supporter" element={<S1_Supporter/>}/>
              <Route path="/volunteer" element={<S2_Volunteer/>}/>
              <Route path="/pratice" element={<S3_Pratice/>}/>
              
              <Route path="/board" element={<Board/>}/>
              <Route path="/boardpost" element={<BoardPost/>}/>
              <Route path="/boarddetail" element={<BoardDetail/>}/>

              <Route path="/question" element={<Question/>}/>
              <Route path="/questionpost" element={<QuestionPost/>}/>
              <Route path="/questiondetail" element={<QuestionDetail/>}/>

              <Route path="/rehabilitate" element={<RehabilitateNotice/>}/>

              <Route path="/admin/*" element={<AdminMain/>}/>
            </Routes>
          </div>
        </RecoilRoot>
      </div>
  );
}

export default App;
