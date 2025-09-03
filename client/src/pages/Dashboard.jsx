import { useContext } from 'react';
import { WalletContext } from '../WalletContext';

function Dashboard() {
  const { wallet } = useContext(WalletContext);

  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="wallet-container">
      <h2>Wallet Dashboard</h2>
      <p><strong>Address:</strong> {wallet.address}</p>
      <p>This is a placeholder for the wallet dashboard. Balance and transaction features will be added next.</p>
    </div>
  );
}

export default Dashboard;