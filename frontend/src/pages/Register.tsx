import React, { useState } from 'react';
import { Tab, Tabs, Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { KetcherEditor } from '../components/KetcherEditor'; 

interface Variant {
  cas?: string;
  stereochemistry?: string;
}

interface Compound {
  smiles: string;
  synonyms?: string[]; 
  variants: Variant[];
}

const Register: React.FC = () => {
  const [regCompound, setRegCompound] = useState<Compound>({
    smiles: '',
    synonyms: [],
    variants: [],
  });

  const [editCompound, setEditCompound] = useState<Compound>({
    smiles: '',
    synonyms: [],
    variants: [],
  });

  const [showSketcherModal, setShowSketcherModal] = useState(false);

  const handleSketcherExtract = (smiles: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditCompound({ ...editCompound, smiles });
    } else {
      setRegCompound({ ...regCompound, smiles });
    }
    setShowSketcherModal(false);
  };

  const handleCompoundChange = (
    compound: Compound,
    setCompound: React.Dispatch<React.SetStateAction<Compound>>,
    field: keyof Compound,
    value: any
  ) => setCompound({ ...compound, [field]: value });

  const handleVariantChange = (
    compound: Compound,
    setCompound: React.Dispatch<React.SetStateAction<Compound>>,
    index: number,
    field: keyof Variant,
    value: any
  ) => {
    const newVariants = [...compound.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setCompound({ ...compound, variants: newVariants });
  };

  const handleCompoundSynonymsChange = (
    compound: Compound,
    setCompound: React.Dispatch<React.SetStateAction<Compound>>,
    value: string
  ) => {
    const synonymsArray = value.split(',').map((s) => s.trim());
    setCompound({ ...compound, synonyms: synonymsArray });
  };

  const addVariant = (compound: Compound, setCompound: React.Dispatch<React.SetStateAction<Compound>>) => {
    setCompound({
      ...compound,
      variants: [...compound.variants, { cas: '', stereochemistry: '' }],
    });
  };

  const removeVariant = (compound: Compound, setCompound: React.Dispatch<React.SetStateAction<Compound>>, index: number) => {
    const newVariants = [...compound.variants];
    newVariants.splice(index, 1);
    setCompound({ ...compound, variants: newVariants });
  };

  const renderVariants = (compound: Compound, setCompound: React.Dispatch<React.SetStateAction<Compound>>) =>
    compound.variants.map((v, i) => (
      <div key={i} className="mb-3 p-2 border rounded">
        <Row className="mb-2">
          <Col>
            <Form.Label>CAS#</Form.Label>
            <Form.Control
              type="text"
              value={v.cas || ''}
              onChange={(e) => handleVariantChange(compound, setCompound, i, 'cas', e.target.value)}
            />
          </Col>
          <Col>
            <Form.Label>Stereochemistry / Notes</Form.Label>
            <Form.Control
              type="text"
              value={v.stereochemistry || ''}
              onChange={(e) => handleVariantChange(compound, setCompound, i, 'stereochemistry', e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Button variant="outline-danger" onClick={() => removeVariant(compound, setCompound, i)}>X</Button>
          </Col>
        </Row>
      </div>
    ));


  return (
    <Container className="py-3">
      <Tabs defaultActiveKey="register" id="register-tabs">
        <Tab eventKey="register" title="Register Compound">
          <Form className="mt-3">
            <Row className="mb-3">
              <Col>
                <Form.Label>SMILES *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={regCompound.smiles}
                  onChange={(e) => handleCompoundChange(regCompound, setRegCompound, 'smiles', e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  className="mt-2"
                  onClick={() => setShowSketcherModal(true)}
                >
                  Draw Structure
                </Button>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Synonyms (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={(regCompound.synonyms || []).join(', ')}
                  onChange={(e) => handleCompoundSynonymsChange(regCompound, setRegCompound, e.target.value)}
                />
              </Col>
            </Row>

            {renderVariants(regCompound, setRegCompound)}

            <Button
              variant="outline-primary"
              className="w-100 mb-3"
              onClick={() => addVariant(regCompound, setRegCompound)}
            >
              Add Variant
            </Button>

            <Button variant="success" type="submit" className="w-100">
              Register Compound
            </Button>
          </Form>
        </Tab>
        <Tab eventKey="edit" title="Edit Compound">
          <Form className="mt-3">
            <Row className="mb-3">
              <Col>
                <Form.Label>SMILES *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={editCompound.smiles}
                  onChange={(e) => handleCompoundChange(editCompound, setEditCompound, 'smiles', e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  className="mt-2"
                  onClick={() => setShowSketcherModal(true)}
                >
                  Draw Structure
                </Button>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Synonyms (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={(editCompound.synonyms || []).join(', ')}
                  onChange={(e) => handleCompoundSynonymsChange(editCompound, setEditCompound, e.target.value)}
                />
              </Col>
            </Row>

            {renderVariants(editCompound, setEditCompound)}

            <Button
              variant="outline-primary"
              className="w-100 mb-3"
              onClick={() => addVariant(editCompound, setEditCompound)}
            >
              Edit Variant
            </Button>

            <Button variant="primary" type="submit" className="w-100">
              Update Compound
            </Button>
          </Form>
        </Tab>
      </Tabs>

      <Modal
        show={showSketcherModal}
        onHide={() => setShowSketcherModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Draw Molecular Structure</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <KetcherEditor key={'ketcher'} onExtract={(smiles) => handleSketcherExtract(smiles)} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Register;
