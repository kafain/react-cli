import React, { lazy, Suspense } from "react";
// import Home from "./page/Home/index";
// import About from "./page/About/index";
import { Link, Routes, Route } from "react-router-dom";
import { Button } from "antd";

const Home = lazy(() => import(/* webpackChunkName:'home' */ "./page/Home"));
const About = lazy(() => import(/* webpackChunkName:'about' */ "./page/About"));

function App() {
  return (
    <div>
      <h1>app</h1>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <Button></Button>
      </ul>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/about" element={<About />}></Route>
        </Routes>
      </Suspense>
    </div>
  );
}
export default App;
