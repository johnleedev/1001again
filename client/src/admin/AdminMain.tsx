
import './Admin.scss'; 
import { Routes, Route } from 'react-router-dom';
import Main from './Main';
import Login from './Login';
import EditMainInfo from './edit/EditMainInfo';
import EditGallery from './edit/EditGallery';
import EditPractice from './edit/EditPractice';


export default function AdminMain( props: any) {

  return (
    <div className="AdminContainer">
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/main" element={<Main/>}/>
        <Route path="/edit/main-info" element={<EditMainInfo/>}/>
        <Route path="/edit/gallery" element={<EditGallery/>}/>
        <Route path="/edit/support-practice" element={<EditPractice/>}/>
      </Routes>
    </div>
  );
}
