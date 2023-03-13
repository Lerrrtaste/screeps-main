import * as React from 'react';
import { Link, Route, Routes } from "react-router-dom";

import Button from '@mui/material/Button';
import CreepList from './components/creepList';

import './App.css';

function App() {
    return (
        <div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/creeps">Creep List</Link>
                <Link to="/classes">Creep Classes</Link>
            </nav>
            <Routes>
                <Route path="/" element={<h1>wip dashboard</h1>} />
                <Route path="/creeps" element={<CreepList />} />
                <Route path="/classes" element={<h1>wip classes</h1>} />
            </Routes>
        </div>
    );
}

export default App;
