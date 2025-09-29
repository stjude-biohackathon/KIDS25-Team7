import { Search } from "lucide-react"
import type React from "react"
import { Card, Col, Container, Row } from "react-bootstrap"
import { Link } from "react-router-dom"
import '../css/Home.css'

const Home: React.FC = () => {
  return (
    <Container>
      <Row className="justify-content-center g-4">
        <Col md={4}>
          <Link to="/search" className="tool-link">
            <Card className="h-100 shadow-sm tool-card">
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <Search size={48} className="mb-3 tool-icon text-muted" />
                <Card.Title>Compound Search</Card.Title>
                <Card.Text>Search for compounds</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </Container>
  )
}

export default Home