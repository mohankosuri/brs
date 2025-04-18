 import React from 'react'
 import ReconcileTool from './ReconcileTool'
import VideoBackground from './VideoBackground'
import { Routes,Route } from 'react-router-dom'
 
 const App = () => {
   return (
     <div className="h-screen bg-gray-100">


   
    <Routes>
    <Route path='/' element={<VideoBackground/>}></Route>
      <Route path='/brs' element={<ReconcileTool/>}></Route>
    </Routes>
    
     </div>
   )
 }
 
 export default App