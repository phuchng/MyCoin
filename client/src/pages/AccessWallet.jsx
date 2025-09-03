import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Form, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { WalletContext } from '../WalletContext';

function AccessWallet() {
  const [key, setKey] = useState('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Use a short timeout to allow the UI to re-render with the loading state
    // before the potentially blocking decryption/validation starts.
    setTimeout(async () => {
      try {
        let unlockedWallet;
        if (key === 'mnemonic') {
          if (!mnemonic) throw new Error('Mnemonic phrase is required.');
          unlockedWallet = ethers.Wallet.fromMnemonic(mnemonic);
        } else if (key === 'keystore') {
          if (!keystore || !password) throw new Error('Keystore file and password are required.');
          const keystoreJson = await keystore.text();
          unlockedWallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password);
        }

        if (unlockedWallet) {
          setWallet(unlockedWallet);
          navigate('/wallet');
        }
      } catch (err) {
        setError(err.message || 'Failed to access wallet. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setKeystore(file);
  };

  const accessButtonContent = (
    <>
      {loading ? (
        <>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          {' '}Accessing...
        </>
      ) : 'Access Wallet'}
    </>
  );

  return (
    <div className="wallet-container">
      <h2>Access Your Wallet</h2>
      <p>Please select your method to access your wallet.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="mnemonic" title="Mnemonic Phrase">
          <Form onSubmit={handleAccess}>
            <Form.Group className="mb-3">
              <Form.Label>Enter your Mnemonic Phrase</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Enter 12 or 24 word mnemonic phrase" 
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
              />
            </Form.Group>
            <Button variant="success" type="submit" disabled={loading}>{accessButtonContent}</Button>
          </Form>
        </Tab>
        <Tab eventKey="keystore" title="Keystore File">
          <Form onSubmit={handleAccess}>
            <Form.Group className="mb-3">
              <Form.Label>Select your Keystore File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Enter your Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="success" type="submit" disabled={loading}>{accessButtonContent}</Button>
          </Form>
        </Tab>
      </Tabs>
    </div>
  );
}

export default AccessWallet;