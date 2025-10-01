import { Outlet, Link } from "react-router";
import { Container, Nav, Navbar } from "react-bootstrap";
import type React from "react";
import { useEffect, useState } from "react";
import ThemeChanger from "../components/ThemeChanger";

export const Navigation: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute("data-bs-theme") === "dark";
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-bs-theme") {
          const theme = document.documentElement.getAttribute("data-bs-theme");
          setIsDark(theme === "dark");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <Navbar
        className="bg-body text-body shadow-sm px-3"
        expand="lg"
      >
        <Container fluid>
          <Navbar.Brand style={{ display: 'flex' }}>
            {isDark ? (
              <span><img src="/dark_logo.png" alt="Radar" height="30" /></span>
            ) : (
              <span><img src="/light_logo.png" alt="Radar" height="30" /></span>
            )}
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="search" className="nav-link">Search</Link>
              <Link to="register" className="nav-link">Modify</Link>
            </Nav>

            <div className="d-flex">
              <ThemeChanger />
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Outlet />
      </Container>
    </div>
  );
};