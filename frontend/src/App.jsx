import { useEffect, useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage/LoginPage';
import AppRoutes from './AppRoutes';

// Set up user context
const UserContext = createContext()

export default function App() {

  // State for user context
  const [user, setUser] = useState(null)
  
  // Check server connection automatically 
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.log(err))
  }, []);

  return (
    <>
    <UserContext.Provider value={{user, setUser}}>
      <AppRoutes />
    </UserContext.Provider>
    </>
  )
}

export { UserContext }

