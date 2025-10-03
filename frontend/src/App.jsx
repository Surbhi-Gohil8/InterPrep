import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"


import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/signUp'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Home/Dashboard'
import InterviewPrep from './pages/InterviewPrep/InterviewPrep'
import UserProvider from './context/userContext'
import QuestionCard from './components/Cards/QuestionCard'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        {/* Global toaster for notifications */}
        <Toaster position="top-right" />
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signUp' element={<SignUp/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/interview-prep/:sessionId' element={<InterviewPrep/>}/>
          <Route path='/queso' element={<QuestionCard/>}/>

        </Routes>
      </Router>

    </div>
    </UserProvider>


  )
}

export default App