import React from 'react';
/* import Counter from './components/Counter/Counter'; */
/* import { useAppDispatch, useAppSelector } from './redux/hooks'; */
/* import { counterActions } from './redux/counter/slice'; */
import { Link, Route, Routes } from "react-router-dom";

import './App.css';

import CreepsList from './components/CreepsList/CreepsList';
import Settings from './components/Settings/Settings';

function App(): JSX.Element {
  /* const dispatch = useAppDispatch(); */

  /* const { value } = useAppSelector((state) => state.counter);

   * const increment = (): void => {
   *   dispatch(counterActions.increment());
   * };

   * const decrement = (): void => {
   *   dispatch(counterActions.decrement());
   * };

   * const incrementAsync = (): void => {
   *   dispatch(counterActions.incrementAsync());
   * };

   * const decrementAsync = (): void => {
   *   dispatch(counterActions.decrementAsync());
   * }; */

  return (
    <div className="App">
        <div>
            <nav>
                {/* <Link to="/">Home</Link> */}
                <Link to="/creeps">Creep List</Link>
                {/* <Link to="/classes">Creep Classes</Link> */}
                <Link to="/Settings">Settings</Link>
            </nav>
            <Routes>
                <Route path="/" element={<h1>wip dashboard</h1>} />
                <Route path="/creeps" element={<CreepsList />} />
                <Route path="/classes" element={<h1>wip classes</h1>} />
                <Route path="/settings" element={<Settings />}/>
                <Route path="/*" element={<h1> Page does not exist</h1>} />
            </Routes>
        </div>
    </div>
  );
}

export default App;
