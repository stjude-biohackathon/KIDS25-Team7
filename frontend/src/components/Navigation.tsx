import { Outlet, Link } from "react-router";
import { Container, Nav, Navbar } from "react-bootstrap";
import type React from "react";

export const Navigation: React.FC = () => {
  return (
    <div>
      <Navbar bg="light">
        <Container fluid>
          <Navbar.Brand style={{ display: 'flex' }}>
            <span>Searchr</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="search" className="nav-link">Search</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid><Outlet /></Container>
    </div>
  )
}