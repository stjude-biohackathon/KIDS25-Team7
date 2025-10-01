import React from "react";
import { Route, createHashRouter, RouterProvider, createRoutesFromElements } from "react-router-dom";
import Home from "./pages/Home";
import { Navigation } from "./components/Navigation";
import NavbarHeightAdjuster from "./components/NavbarHeightAdjuster";
import Search from "./pages/Search/Search";
import Compound from "./pages/Compound";
import Register from "./pages/Register";

const Layout = () => (
  <div>
    <Navigation />
    <NavbarHeightAdjuster />
  </div>
)

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="search" element={<Search />} />
      <Route path="compound" element={<Compound />} />
      <Route path="compound/:regNumber" element={<Compound />} />
      <Route path="compound/:regNumber/:varNumber" element={<></>} />
      <Route path="register" element={<Register />} />

    </Route>
  )
)

export const Router: React.FC = () => {
  return (
    <RouterProvider router={router} />
  )
}