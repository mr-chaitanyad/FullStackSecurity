import React,{useEffect,useState} from 'react'
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WeatherDashboard from './pages/WeatherDashboard';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import { Route, Routes } from 'react-router-dom';



function App() {
  
  useEffect(()=>{ 
  
  });

  return (
    <>
    <Navbar/>
    <Routes>
    <Route path='/' Component={WeatherDashboard}/>
    <Route path='/adminDashboard' Component={AdminDashboard}/>
    <Route path='/weatherDashboard' Component={WeatherDashboard}/>
    <Route path='/login' Component={LoginPage}/>
    <Route path='/signup' Component={SignupPage}/>
    </Routes>
    </>
  );
}

export default App;