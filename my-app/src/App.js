import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router from react-router-dom
import { AuthProvider } from './Components/RegisterLogin';  // Import AuthProvider from RegisterLogin
import RegisterLogin from './Components/RegisterLogin';     // Import RegisterLogin component
import './index.css';

function App() {
  return (
    <Router> {/* Wrap the routes with BrowserRouter */}
      <AuthProvider>  {/* Provide AuthContext to the app */}
        <Routes>
          <Route path="/" element={<RegisterLogin />} />
          <Route path="/login" element={<RegisterLogin />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
