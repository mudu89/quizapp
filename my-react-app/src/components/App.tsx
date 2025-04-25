import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainPage from './landing/MainPage';
import HostPage from './host/HostPage';
import PlayerPage from './player/PlayerPage';
import Questions from './host/Questions';
import RunSession from './host/RunSession';

const AdminPage = () => <div id="admin-page">Admin Page</div>;

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/host" element={<HostPage location={useLocation()} />} />
      <Route path="/host/:access_code" element={<Questions location={useLocation()} />} />
      <Route path="host/:access_code/start" element={<RunSession location={useLocation()}/>} />
      <Route path="/player/:access_code/:player_name/:session_id" element={<PlayerPage />} />
    </Routes>
  );
};

export default App;