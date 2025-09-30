import { Outlet, Link } from "react-router";
import { Container, Nav, Navbar } from "react-bootstrap";
import type React from "react";
import ThemeChanger from "../components/ThemeChanger";

export const Navigation: React.FC = () => {
  return (
    <div>
      <Navbar
        className="bg-body text-body shadow-sm px-3"
        expand="lg"
      >
        <Container fluid>
          <Navbar.Brand style={{ display: 'flex' }}>
            <span>Searchr</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="search" className="nav-link">Search</Link>
              <Link to="compound" className="nav-link">Compound Viewer</Link>
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
