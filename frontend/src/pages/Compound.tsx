import React from "react";
import { useParams } from "react-router-dom";
import { Card, Col, Container, Row, Spinner, Alert, Badge } from "react-bootstrap";
import MoleculeStructure from "../components/MoleculeStructure";
import { useRDKit } from "../utils/utils";
import { useGetCompoundDetail } from "../api/useApi";

const Compound: React.FC = () => {
  const { regNumber } = useParams<{ regNumber: string }>();
  const { RDKit, error: rdkitError } = useRDKit();
  const { data: compound, isLoading, error } = useGetCompoundDetail(regNumber || '');

  if (!regNumber) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          No compound registration number provided. Please navigate to a compound using its registration number.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading compound details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Error loading compound: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!compound) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          No compound found with registration number: {regNumber}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">{compound.reg_number}</h5>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <MoleculeStructure
                id={`compound-${compound.reg_number}`}
                molName={compound.reg_number}
                rdkit={RDKit}
                error={rdkitError}
                structure={compound.structure}
                width={350}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Compound Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6 className="text-muted mb-2">IUPAC Name</h6>
                <p className="mb-0">{compound.iupac_name}</p>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Base Formula</h6>
                  <p className="mb-0">{compound.base_formula}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Molecular Weight</h6>
                  <p className="mb-0">{compound.base_formula_weight.toFixed(4)} g/mol</p>
                </Col>
              </Row>

              {compound.variants && compound.variants.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Variants</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {compound.variants.map((variant, idx) => (
                      <Badge key={idx} bg="primary" pill>
                        {variant.full_variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {compound.synonyms && compound.synonyms.length > 0 && (
                <div>
                  <h6 className="text-muted mb-2">Synonyms</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {compound.synonyms.map((synonym, idx) => (
                      <Badge key={idx} bg="secondary" pill>
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Compound;