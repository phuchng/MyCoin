import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Alert, Card } from 'react-bootstrap';
import Transaction from '../components/Transaction';

function AddressDetail() {
  const { address } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await fetch(`/api/address/${address}`);
        if (!res.ok) {
          throw new Error('Public key not found or error fetching data.');
        }
        const addressData = await res.json();
        setData(addressData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAddressData();
  }, [address]);

  return (
    <div className="wallet-container">
      <h2>Public Key Details</h2>
      {loading && <div className="text-center my-4"><Spinner animation="border" variant="success" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {data && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Summary</Card.Title>
              <p style={{wordBreak: 'break-all'}}><strong>Public Key:</strong> {data.address}</p>
              <h4><strong>Balance:</strong> <span className="text-success">{data.balance} MyCoin</span></h4>
            </Card.Body>
          </Card>

          <h4>Transaction History</h4>
          {data.transactions.length > 0 ? (
            data.transactions.map(tx => <Transaction key={tx.id} transaction={tx} />)
          ) : (
            <p className="text-muted">No transactions found for this public key.</p>
          )}
        </>
      )}
    </div>
  );
}

export default AddressDetail;