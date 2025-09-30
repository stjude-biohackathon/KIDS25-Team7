import React, { useState } from 'react'
import { Button, ButtonGroup, Card, Col, Container, Form, Modal, Pagination, Row, ToggleButton } from 'react-bootstrap'
import MoleculeStructure from '../../components/MoleculeStructure'
import { KetcherEditor } from '../../components/KetcherEditor'
import { cleanSmiles, useRDKit, buildLibraryAndGetMolecules, filterBySubstructure } from '../../utils/utils'
import { useSearchDatabaseMutation } from '../../api/useApi'
import '../../css/Search.css'

type SearchMode = 'database' | 'custom'

interface SearchResults {
  smiles: string
  name: string | null
  index: number
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('database')
  const [customSmiles, setCustomSmiles] = useState('')
  const [showSketcherModal, setShowSketcherModal] = useState(false)
  const [results, setResults] = useState<SearchResults[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 9

  const { RDKit, error: rdkitError } = useRDKit()


  const searchMutation = useSearchDatabaseMutation({
    onSuccess: (data) => {
      console.log('Search successful:', data);
    },
    onError: (error) => {
      console.error('Search failed:', error);
    }
  });

  const handleSketcherExtract = (smiles: string) => {
    setSearchQuery(smiles)
    setShowSketcherModal(false)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(true)
      setCurrentPage(1)
      return
    }

    if (searchMode === 'database') {
      searchMutation.mutate({ query: searchQuery })
      if (searchMutation.isSuccess && RDKit) {
        const smilesArray = searchMutation.data.map(compound => ({
          smiles: compound.smiles,
          name: compound.reg_number
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

  return (
    <Container fluid className="p-3 search-results">
      <Row className="h-100">
        <Col md={4} className="mb-3">
          <Card>
            <Card.Header>Substructure Search</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Search Query (SMILES/SMARTS)</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter pattern"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowSketcherModal(true)}
                    style={{ whiteSpace: 'nowrap' }}
                    className='mt-2'
                  >
                    Launch Sketcher
                  </Button>
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
                  onClick={handleSearch}
                  className="w-100"
                  disabled={!RDKit || rdkitError}
                >
                  {!RDKit && !rdkitError ? 'Loading RDKit...' : 'Search'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
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
                  {searchQuery.trim() === ''
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
                      <Card className="results-card h-100">
                        <Card.Header className="results-card-header text-truncate" title={mol.name || mol.smiles}>
                          {mol.name || mol.smiles}
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                          <MoleculeStructure
                            id={`mol-${mol.index}-${idx}`}
                            molName={mol.name || undefined}
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