import React from "react";
import { Route, createHashRouter, RouterProvider, createRoutesFromElements } from "react-router-dom";
import Home from "./pages/Home";
import { Navigation } from "./components/Navigation";
import NavbarHeightAdjuster from "./components/NavbarHeightAdjuster";

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
      <Route path="search" element={<div>Search Page</div>} />
    </Route>
  )
)

export const Router: React.FC = () => {
  return (
    <RouterProvider router={router} />
  )
}