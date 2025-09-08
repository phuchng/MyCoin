import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Pagination, Spinner, Alert, Accordion, Card, ListGroup } from 'react-bootstrap';
import Block from '../components/Block';

const BLOCKS_PER_PAGE = 5;

function Explorer() {
  const [blocks, setBlocks] = useState([]);
  const [blockCount, setBlockCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [knownAddresses, setKnownAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const lengthRes = await fetch('/api/blocks/length');
        const count = await lengthRes.json();
        setBlockCount(count);

        const addressesRes = await fetch('/api/known-addresses');
        const addresses = await addressesRes.json();
        setKnownAddresses(addresses);
      } catch (err) {
        setError('Failed to fetch blockchain data. The node might be offline.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (blockCount === 0 && !error) return; // Don't fetch if count is 0
    const fetchBlocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blocks/${currentPage}`);
        const blocksData = await res.json();
        // The API returns a limited number of blocks, not the full chain
        setBlocks(blocksData.slice(0, BLOCKS_PER_PAGE));
      } catch (err) {
        setError('Failed to fetch blocks.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [currentPage, blockCount, error]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) {
      navigate(`/address/${searchInput}`);
    }
  };

  const totalPages = Math.ceil(blockCount / BLOCKS_PER_PAGE);

  const renderPagination = () => {
    let items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number + 1}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  return (
    <div>
      <h2>Blockchain Explorer</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Search by Public Key</Card.Title>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control 
                placeholder="Enter a public key" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button variant="outline-secondary" type="submit">Search</Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      <div className="row">
        <div className="col-lg-8">
          <h4>Latest Blocks</h4>
          {loading && <div className="text-center my-4"><Spinner animation="border" variant="success" /></div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && blocks.length > 0 && (
            <>
              <Accordion alwaysOpen>
                {blocks.map((block, index) => {
                  const blockNumber = blockCount - 1 - (currentPage * BLOCKS_PER_PAGE) - index;
                  return <Block key={block.hash} block={block} blockNumber={blockNumber} />;
                })}
              </Accordion>
              <div className="d-flex justify-content-center mt-3">
                {renderPagination()}
              </div>
            </>
          )}
          {!loading && blocks.length === 0 && !error && <p>No blocks found.</p>}
        </div>
        <div className="col-lg-4">
          <h4>Known Public Keys</h4>
          {knownAddresses.length > 0 ? (
            <ListGroup>
              {knownAddresses.slice(0, 10).map(address => (
                <ListGroup.Item key={address} action onClick={() => navigate(`/address/${address}`)} style={{cursor: 'pointer'}}>
                  <small style={{wordBreak: 'break-all'}}>{address}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">No transactions have occurred yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explorer;