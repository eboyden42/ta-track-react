import { useEffect, useState } from 'react';
import LoginPage from './Pages/LoginPage/LoginPage';
import AppRoutes from './AppRoutes';

export default function App() {
  // Check server connection automatically 
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <AppRoutes />
    </>
  )
}

