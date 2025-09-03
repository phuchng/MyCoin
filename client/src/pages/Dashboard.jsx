import { useContext, useState, useEffect, useCallback } from 'react';
import { WalletContext } from '../WalletContext';
import { Card, Form, Button, InputGroup, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Transaction from '../components/Transaction';
import cryptoHash from '../util/crypto-hash';
import { ec as EC } from 'elliptic';
import { v1 as uuidv1 } from 'uuid';

const ec = new EC('secp256k1');

function Dashboard() {
  const { wallet } = useContext(WalletContext);
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const [toolLoading, setToolLoading] = useState(null); // 'faucet' or 'mine'
  const [toolMessage, setToolMessage] = useState({ type: '', text: '' });

  const fetchWalletData = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/address/${wallet.address}`);
      if (!res.ok) throw new Error('Failed to fetch wallet data.');
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendError('');
    setSendSuccess('');

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSendError('Please enter a valid amount.');
      setSendLoading(false);
      return;
    }

    try {
      // Fetch the latest balance to construct the transaction
      const balanceRes = await fetch(`/api/address/${wallet.address}`);
      const { balance: currentBalance } = await balanceRes.json();
      
      if (parsedAmount > currentBalance) {
        throw new Error('Amount exceeds balance.');
      }
      
      const outputMap = {
        [recipient]: parsedAmount,
        [wallet.address]: currentBalance - parsedAmount
      };

      const keyPair = ec.keyFromPrivate(wallet.privateKey.substring(2), 'hex');
      const signature = keyPair.sign(cryptoHash(outputMap)).toDER('hex');

      const transaction = {
        id: uuidv1(),
        outputMap,
        input: {
          timestamp: Date.now(),
          amount: currentBalance,
          address: wallet.address,
          signature
        }
      };

      const res = await fetch('/api/transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });

      const result = await res.json();
      if (result.type === 'error') {
        throw new Error(result.message);
      }

      setSendSuccess('Transaction sent successfully!');
      setRecipient('');
      setAmount('');
      setTimeout(fetchWalletData, 1000); // Refresh data after a short delay

    } catch (err) {
      setSendError(err.message);
    } finally {
      setSendLoading(false);
    }
  };

  const handleFaucet = async () => {
    setToolLoading('faucet');
    setToolMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/faucet-transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: wallet.address })
      });
      const result = await res.json();
      if (result.type === 'error') throw new Error(result.message);
      setToolMessage({ type: 'success', text: 'Faucet transaction created. Mine the next block to receive funds.' });
    } catch (err) {
      setToolMessage({ type: 'danger', text: err.message });
    } finally {
      setToolLoading(null);
    }
  };

  const handleMine = async () => {
    setToolLoading('mine');
    setToolMessage({ type: '', text: '' });
    try {
      await fetch('/api/mine-transactions');
      setToolMessage({ type: 'success', text: 'Mining request sent! The blockchain is being updated.' });
      setTimeout(fetchWalletData, 1000); // Refresh data after mining
    } catch (err) {
      setToolMessage({ type: 'danger', text: 'Mining request failed.' });
    } finally {
      setToolLoading(null);
    }
  };


  if (loading) {
    return <div className="text-center my-4"><Spinner animation="border" variant="success" /></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header as="h5">Wallet Overview</Card.Header>
            <Card.Body>
              <p style={{ wordBreak: 'break-all' }}><strong>Address:</strong> {wallet.address}</p>
              <h4><strong>Balance:</strong> <span className="text-success">{balance} MyCoin</span></h4>
              <Button variant="outline-secondary" size="sm" onClick={fetchWalletData}>Refresh</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Send MyCoin</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSend}>
                <Form.Group className="mb-3">
                  <Form.Label>Recipient Address</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter address" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <InputGroup.Text>MyCoin</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                {sendError && <Alert variant="danger" className="py-2">{sendError}</Alert>}
                {sendSuccess && <Alert variant="success" className="py-2">{sendSuccess}</Alert>}
                <Button variant="success" type="submit" disabled={sendLoading}>
                  {sendLoading ? <><Spinner as="span" size="sm" /> Sending...</> : 'Send'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header as="h5">Tools</Card.Header>
            <Card.Body>
              <Button 
                variant="outline-primary" 
                className="me-2" 
                onClick={handleFaucet} 
                disabled={toolLoading}
              >
                {toolLoading === 'faucet' ? <><Spinner as="span" size="sm" /> Requesting...</> : 'Request from Faucet'}
              </Button>
              <Button 
                variant="outline-dark" 
                onClick={handleMine} 
                disabled={toolLoading}
              >
                {toolLoading === 'mine' ? <><Spinner as="span" size="sm" /> Mining...</> : 'Request Transaction Mining'}
              </Button>
              {toolMessage.text && <Alert variant={toolMessage.type} className="mt-3 py-2">{toolMessage.text}</Alert>}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header as="h5">Transaction History</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {transactions.length > 0 ? (
                transactions.map(tx => (
                  <ListGroup.Item key={tx.id} className="p-0">
                    <Transaction transaction={tx} />
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  <p className="text-muted text-center mb-0 py-3">No transactions found.</p>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;