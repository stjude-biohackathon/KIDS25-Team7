import React, { useState } from 'react'
import { Button, ButtonGroup, Card, Col, Container, Form, Modal, Pagination, Row, ToggleButton } from 'react-bootstrap'
import MoleculeStructure from '../../components/MoleculeStructure'
import { KetcherEditor } from '../../components/KetcherEditor'
import { cleanSmiles, useRDKit, buildLibraryAndGetMolecules, filterBySubstructure, molName } from '../../utils/utils'
import { useSearchDatabase, useTextSearch } from '../../api/useApi'
import '../../css/Search.css'
import { Download } from 'lucide-react'
import type { SearchMode, SearchResults } from '../../types/types'
import { useNavigate } from 'react-router-dom'

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('database')
  const [customSmiles, setCustomSmiles] = useState('')
  const [showSketcherModal, setShowSketcherModal] = useState(false)
  const [results, setResults] = useState<SearchResults[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [identifierFields, setIdentifierFields] = useState({
    regn: '',
    syn: '',
    cas: ''
  })
  const resultsPerPage = 9

  const { RDKit, error: rdkitError } = useRDKit()
  const { refetch: searchRefetch, isFetching: searchIsFetching } = useSearchDatabase(searchQuery)
  const { refetch: textSearchRefetch, isFetching: textSearchIsFetching } = useTextSearch(
    identifierFields.regn,
    identifierFields.syn,
    identifierFields.cas
  )
  let navigate = useNavigate()

  const handleSketcherExtract = (smiles: string) => {
    setSearchQuery(smiles)
    setShowSketcherModal(false)
  }

  const handleRouteNav = (regNum: string) => {
    const path = '/compound/' + regNum
    if (searchMode === 'database') { navigate(path) }
  }

  const handleIdentifierFieldChange = (field: string, value: string) => {
    setIdentifierFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIdentifierSearch = async () => {
    setResults([])

    if (!identifierFields.regn.trim() && !identifierFields.syn.trim() && !identifierFields.cas.trim()) {
      setResults([])
      setHasSearched(true)
      setCurrentPage(1)
      return
    }

    const { data } = await textSearchRefetch()
    if (data && RDKit) {
      const smilesArray = data.map(compound => ({
        smiles: compound.structure,
        regNumber: compound.reg_number,
        variant: compound.variant
      }))

      const { molecules } = buildLibraryAndGetMolecules(RDKit, smilesArray)
      setResults(molecules)
    } else {
      setResults([])
    }

    setHasSearched(true)
    setCurrentPage(1)
  }

  const handleSubstructureSearch = async () => {
    setResults([])
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(true)
      setCurrentPage(1)
      return
    }

    if (searchMode === 'database') {

      const { data } = await searchRefetch()
      if (data && RDKit) {
        const smilesArray = data.map(compound => ({
          smiles: compound.structure,
          regNumber: compound.reg_number,
          variant: compound.variant
        }))

        const { library, molecules } = buildLibraryAndGetMolecules(RDKit, smilesArray)

        if (library) {
          const filtered = filterBySubstructure(RDKit, library, molecules, searchQuery)
          setResults(filtered)
        } else {
          setResults([])
        }
      } else {
        setResults([])
      }
    } else {
      if (!RDKit || !customSmiles.trim()) {
        setResults([])
        setHasSearched(true)
        setCurrentPage(1)
        return
      }

      const smilesArray = customSmiles
        .split(/\r?\n/)
        .map(line => cleanSmiles(line))
        .filter(item => item.smiles.length > 0)

      const { library, molecules } = buildLibraryAndGetMolecules(RDKit, smilesArray)

      if (library) {
        const filtered = filterBySubstructure(RDKit, library, molecules, searchQuery)
        setResults(filtered)
      } else {
        setResults([])
      }
    }

    setHasSearched(true)
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const headers: string[] = ['regNumber', 'variant', 'smiles']
    const rows: string[][] = []
    rows.push(headers)
    for (const line of results) {
      const row: string[] = []
      row.push(line.regNumber)
      line.variant ? row.push(line.variant) : row.push('')
      row.push(line.smiles)
      rows.push(row)
    }
    const csvString = rows.map(row =>
      row.map(cell => {
        const cellStr = cell.toString();
        // escape cells that contain commas, quotes, or newlines
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    // add a character at the start to tell Excel it's utf-8 encoding and avoid weird characters
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', new Date().toISOString().split('T')[0]);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }


  const totalPages = Math.ceil(results.length / resultsPerPage)
  const indexOfLastResult = currentPage * resultsPerPage
  const indexOfFirstResult = indexOfLastResult - resultsPerPage
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult)

  const renderPaginationItems = () => {
    if (totalPages <= 1) return null

    const items = []
    const maxPagesToShow = 5
    const actualPagesToShow = Math.min(maxPagesToShow, totalPages)

    let startPage = Math.max(1, currentPage - Math.floor(actualPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + actualPagesToShow - 1)

    if (endPage - startPage < actualPagesToShow - 1) {
      startPage = Math.max(1, endPage - actualPagesToShow + 1)
    }

    for (let i = 0; i < actualPagesToShow; i++) {
      const pageNumber = startPage + i
      if (pageNumber <= totalPages) {
        items.push(
          <Pagination.Item
            key={pageNumber}
            active={pageNumber === currentPage}
            onClick={() => setCurrentPage(pageNumber)}
            style={{ minWidth: '2.5rem' }}
          >
            {pageNumber}
          </Pagination.Item>
        )
      }
    }

    return (
      <div style={{ minWidth: '280px' }}>
        <Pagination className="mb-0" size="sm">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{ minWidth: '2.5rem' }}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ minWidth: '2.5rem' }}
          />
          {items}
          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ minWidth: '2.5rem' }}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{ minWidth: '2.5rem' }}
          />
        </Pagination>
      </div>
    )
  }

  const searchBtnText = (!RDKit && !rdkitError)
    ? 'Loading RDKit...'
    : (searchIsFetching ? 'Searching...' : 'Search')

  const textSearchBtnText = (!RDKit && !rdkitError)
    ? 'Loading RDKit...'
    : (textSearchIsFetching ? 'Searching...' : 'Search')

  const isIdentifierSearchDisabled = !RDKit || rdkitError ||
    (!identifierFields.regn.trim() && !identifierFields.syn.trim() && !identifierFields.cas.trim())

  return (
    <Container fluid className="p-3 search-results">
      <Row className="h-100">
        <Col md={4} className="mb-3">
          <Card className="mb-3">
            <Card.Header>Substructure Search</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">Search Query (SMILES only)</Form.Label>
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowSketcherModal(true)}
                      style={{ whiteSpace: 'nowrap' }}
                      size="sm"
                    >
                      Launch Sketcher
                    </Button>
                  </div>
                  <Form.Control
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter pattern"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSubstructureSearch()
                      }
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Search Mode</Form.Label>
                  <ButtonGroup className="d-flex">
                    <ToggleButton
                      id="mode-database"
                      type="radio"
                      variant="outline-primary"
                      name="searchMode"
                      value="database"
                      checked={searchMode === 'database'}
                      onChange={(e) => setSearchMode(e.currentTarget.value as SearchMode)}
                    >
                      Database
                    </ToggleButton>
                    <ToggleButton
                      id="mode-custom"
                      type="radio"
                      variant="outline-primary"
                      name="searchMode"
                      value="custom"
                      checked={searchMode === 'custom'}
                      onChange={(e) => setSearchMode(e.currentTarget.value as SearchMode)}
                    >
                      Custom
                    </ToggleButton>
                  </ButtonGroup>
                </Form.Group>

                {searchMode === 'custom' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Custom SMILES List</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      value={customSmiles}
                      onChange={(e) => setCustomSmiles(e.target.value)}
                      placeholder="Enter SMILES strings (one per line, optionally with names after tab/semicolon/space)"
                    />
                  </Form.Group>
                )}

                <Button
                  variant="primary"
                  onClick={handleSubstructureSearch}
                  className="w-100"
                  disabled={!RDKit || rdkitError}
                >
                  {searchBtnText}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-1">
            <Card.Header>Identifier Search</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-1">
                  <Form.Label>Reg Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={identifierFields.regn}
                    onChange={(e) => handleIdentifierFieldChange('regn', e.target.value)}
                    placeholder="Enter registration number"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleIdentifierSearch()
                      }
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>Synonym</Form.Label>
                  <Form.Control
                    type="text"
                    value={identifierFields.syn}
                    onChange={(e) => handleIdentifierFieldChange('syn', e.target.value)}
                    placeholder="Enter synonym"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleIdentifierSearch()
                      }
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label>CAS</Form.Label>
                  <Form.Control
                    type="text"
                    value={identifierFields.cas}
                    onChange={(e) => handleIdentifierFieldChange('cas', e.target.value)}
                    placeholder="Enter CAS number"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleIdentifierSearch()
                      }
                    }}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleIdentifierSearch}
                  className="w-100"
                  disabled={isIdentifierSearchDisabled}
                >
                  {textSearchBtnText}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Button
            variant={results.length < 1 ? "success-outline" : "success"}
            className="w-100"
            onClick={handleExportCSV}
            disabled={results.length < 1}
          >
            <Download size={14} className="me-1" />
            Export CSV
          </Button>
        </Col>

        <Col md={8} className="d-flex h-100">
          <Card className="shadow-sm overflow-auto w-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <span>Search Results</span>
                {hasSearched && results.length > 0 && (
                  <span className="ms-2 text-muted">
                    ({results.length} {results.length === 1 ? 'match' : 'matches'} found,
                    showing {indexOfFirstResult + 1}-{Math.min(indexOfLastResult, results.length)})
                    {results.length > 1000 ? 'maximum' : ''}
                  </span>
                )}
              </div>
              {renderPaginationItems()}
            </Card.Header>
            <Card.Body className="results-grid">
              {!hasSearched ? (
                <div className="text-center text-muted p-5">
                  Enter a search query and click Search to begin
                </div>
              ) : results.length === 0 ? (
                <div className="text-center text-muted p-5">
                  {searchQuery.trim() === '' && !identifierFields.regn.trim() && !identifierFields.syn.trim() && !identifierFields.cas.trim()
                    ? 'Please enter a search query'
                    : searchMode === 'custom' && !customSmiles.trim()
                      ? 'Please provide a list of SMILES to search'
                      : 'No matching molecules found. Try adjusting your search query.'
                  }
                </div>
              ) : (
                <Row xs={1} md={3} className="g-4">
                  {currentResults.map((mol, idx) => (
                    <Col key={`${mol.index}-${idx}`}>
                      <Card className="result-card h-100" onClick={() => handleRouteNav(mol.regNumber)}>
                        <Card.Header className="result-card-header text-truncate" title={molName(mol)}>
                          {molName(mol)}
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                          <MoleculeStructure
                            id={`mol-${mol.index}-${idx}`}
                            molName={mol.regNumber || undefined}
                            rdkit={RDKit}
                            error={rdkitError}
                            structure={mol.smiles}
                            subStructure={searchQuery}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showSketcherModal}
        onHide={() => setShowSketcherModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Molecular Sketcher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <KetcherEditor key={'ketcher'} onExtract={handleSketcherExtract} />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default Search