import React from "react";
import { useParams } from "react-router-dom";
import { Card, Col, Container, Row, Spinner, Alert, Badge } from "react-bootstrap";
import MoleculeStructure from "../components/MoleculeStructure";
import { useRDKit } from "../utils/utils";
import { useGetCompoundDetail, useGetVariantDetail } from "../api/useApi";
import { useNavigate } from 'react-router-dom'

const Compound: React.FC = () => {
  const { regNumber, varNumber } = useParams<{ regNumber: string; varNumber?: string }>();
  const { RDKit, error: rdkitError } = useRDKit();
  let navigate = useNavigate()
  
  const { data: compound, isLoading: compoundLoading, error: compoundError } = useGetCompoundDetail(
    regNumber || '', 
    { enabled: !!regNumber && !varNumber }
  );
  
  const { data: variant, isLoading: variantLoading, error: variantError } = useGetVariantDetail(
    varNumber || '',
    { enabled: !!varNumber }
  );

  const handleRouteNav = (regNum: string, varNum: string) => {
    const path = '/compound/' + regNum + '/' + varNum
    navigate(path)
  }

  const isLoading = compoundLoading || variantLoading;
  const error = compoundError || variantError;
  const isVariantView = !!varNumber && !!variant;

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
        <p className="mt-2">Loading {isVariantView ? 'variant' : 'compound'} details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Error loading {isVariantView ? 'variant' : 'compound'}: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!compound && !variant) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          No {isVariantView ? 'variant' : 'compound'} found with {isVariantView ? `variant number: ${varNumber}` : `registration number: ${regNumber}`}
        </Alert>
      </Container>
    );
  }

  const displayId = isVariantView 
    ? `${variant!.reg_number}-${variant!.variant}` 
    : compound!.reg_number;
  const structure = isVariantView ? variant!.structure : compound!.structure;
  const iupacName = isVariantView ? variant!.iupac_name : compound!.iupac_name;
  const formula = isVariantView ? variant!.full_formula : compound!.base_formula;
  const formulaWeight = isVariantView ? variant!.full_formula_weight : compound!.base_formula_weight;
  const synonyms = isVariantView ? variant!.synonyms : compound!.synonyms;

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">{displayId}</h5>
              {isVariantView && (
                <small className="text-muted">Variant of {variant!.reg_number}</small>
              )}
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <MoleculeStructure
                id={`${isVariantView ? 'variant' : 'compound'}-${displayId}`}
                molName={displayId}
                rdkit={RDKit}
                error={rdkitError}
                structure={structure}
                width={350}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">{isVariantView ? 'Variant' : 'Compound'} Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6 className="text-muted mb-2">IUPAC Name</h6>
                <p className="mb-0">{iupacName}</p>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">{isVariantView ? 'Full Formula' : 'Base Formula'}</h6>
                  <p className="mb-0">{formula}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Molecular Weight</h6>
                  <p className="mb-0">{formulaWeight.toFixed(4)} g/mol</p>
                </Col>
              </Row>

              {isVariantView && variant!.cas && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">CAS Number</h6>
                  <p className="mb-0">{variant!.cas}</p>
                </div>
              )}

              {isVariantView && variant!.smiles && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">SMILES</h6>
                  <p className="mb-0 font-monospace small">{variant!.smiles}</p>
                </div>
              )}

              {!isVariantView && compound!.variants && compound!.variants.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Variants</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {compound!.variants.map((variant, idx) => (
                      <Badge key={idx} bg="primary" pill onClick={() => handleRouteNav(compound!.reg_number,variant.full_variant)}>
                        {variant.full_variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {isVariantView && variant!.fragments && variant!.fragments.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Fragments</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {variant!.fragments.map((fragment, idx) => (
                      <Badge key={idx} bg="info" pill>
                        {fragment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {synonyms && synonyms.length > 0 && (
                <div>
                  <h6 className="text-muted mb-2">Synonyms</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {synonyms.map((synonym, idx) => (
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