import {  Routes, Route } from "react-router-dom";
import Signup from "./admin_components/Signup"; 
import Login from "./admin_components/Login";
import Home from "./admin_components/Home";
import Createuser from "./admin_components/Createuser";
import Retrieve from "./admin_components/Retrieve";
import Retrieveid from "./admin_components/RetrieveId";
import Update from "./admin_components/Update";
import TrailCreate from "./trail_component/TrailCreate";
import TrailRetrive from "./trail_component/trail_retrieve";
import TrailRetriveid from "./trail_component/trail_retrieve_id";
import TrailUpdate from "./trail_component/trail_update";
import PlayerList from "./admin_components/PlayerList";
import PlayerId from "./admin_components/PlayerId";
import QRScanner from "./user_components/QRScanner";
import StartGame from "./user_components/StartGame";
import QrGenerate from "./admin_components/qrGenerate";


const AppRouter = () => {
  return (
   
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/createUser" element={<Createuser />} />
        <Route path="/retrieve" element={< Retrieve/>} />
        <Route path="/retrieve/:id" element={< Retrieveid/>} />
        <Route path="/update/:id" element={< Update/>} />
        <Route path="/trailCreate" element={<TrailCreate />} />
        <Route path="/trailRetrieve" element={<TrailRetrive />} />
        <Route path="/trailRetrieve/:id" element={<TrailRetriveid />} />
        <Route path="/trailUpdate/:id" element={<TrailUpdate />} />
        <Route path="/PlayerList" element={<PlayerList />} />
        <Route path="/playerId/:playerId" element={<PlayerId />} />
        <Route path="/QRScanner" element={<QRScanner />} />
        <Route path="/startgame/:playerId" element={<StartGame />} />
        <Route path="/QrGenerate" element={<QrGenerate />} />
      
      </Routes>
      
  );
};

export default AppRouter;
