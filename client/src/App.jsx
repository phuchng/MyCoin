import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateWallet from './pages/CreateWallet';
import AccessWallet from './pages/AccessWallet';
import Dashboard from './pages/Dashboard';
import { WalletContext } from './WalletContext';

function App() {
  const [wallet, setWallet] = useState(null);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create-wallet" element={<CreateWallet />} />
          <Route path="access-wallet" element={<AccessWallet />} />
          <Route 
            path="wallet" 
            element={wallet ? <Dashboard /> : <Navigate to="/access-wallet" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </WalletContext.Provider>
  );
}

export default App;