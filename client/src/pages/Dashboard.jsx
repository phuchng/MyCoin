import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WalletContext } from '../WalletContext';
import { Card } from 'react-bootstrap';

function Dashboard() {
  const { wallet } = useContext(WalletContext);

  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="wallet-container">
      <h2>Wallet Dashboard</h2>
      <Card>
        <Card.Body>
          <Card.Title>Your Address</Card.Title>
          <Card.Text>
            <small className="text-muted" style={{ wordBreak: 'break-all' }}>{wallet.address}</small>
          </Card.Text>
          <Link to={`/address/${wallet.address}`}>View Transaction History</Link>
        </Card.Body>
      </Card>
      <div className="mt-4">
        <p>This is a placeholder for the wallet dashboard. Balance and transaction features will be added next.</p>
      </div>
    </div>
  );
}

export default Dashboard;