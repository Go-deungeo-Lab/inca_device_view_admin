import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ManagerApp from './pages/ManagerApp';
import AccessDenied from './components/AccessDenied';

function App() {
    return (
        <DarkModeProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/access-denied" element={<AccessDenied />} />
                        <Route path="/" element={<ManagerApp />} />
                    </Routes>
                </div>
            </Router>
        </DarkModeProvider>
    );
}

export default App;