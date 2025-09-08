import { useState } from 'react';
import { ethers } from 'ethers';
import { Form, Button, Alert, Tabs, Tab, Card, InputGroup, Spinner } from 'react-bootstrap';

function CreateWallet() {
  const [key, setKey] = useState('mnemonic');
  const [newWallet, setNewWallet] = useState(null);
  const [password, setPassword] = useState('');
  const [keystoreJson, setKeystoreJson] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const generateMnemonicWallet = () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setNewWallet(wallet);
      setError('');
      setKeystoreJson(''); // Clear keystore data if switching tabs
    } catch (err) {
      setError('Failed to generate wallet.');
      setNewWallet(null);
    }
  };

  const generateKeystoreWallet = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setLoading(true);

    // Use a short timeout to allow the UI to re-render with the loading state
    // before the computationally expensive encryption begins.
    setTimeout(async () => {
      try {
        // Use less computationally expensive Scrypt parameters for faster generation
        const options = {
          scrypt: {
            N: 1 << 14 // 16384 (ethers.js default is 1 << 18, which is very slow)
          }
        };
        const wallet = ethers.Wallet.createRandom();
        const json = await wallet.encrypt(password, options);
        setNewWallet(wallet);
        setKeystoreJson(json);
      } catch (err) {
        setError('Failed to generate keystore file.');
        setNewWallet(null);
        setKeystoreJson('');
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const downloadKeystore = () => {
    const element = document.createElement("a");
    const file = new Blob([keystoreJson], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `mycoin-keystore-${newWallet.publicKey.substring(2, 10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const resetState = () => {
    setNewWallet(null);
    setError('');
    setPassword('');
    setKeystoreJson('');
    setLoading(false);
  };

  return (
    <div className="wallet-container">
      <h2>Create a New Wallet</h2>
      <p>Please select your preferred method for wallet creation.</p>
      
      <Tabs activeKey={key} onSelect={(k) => { setKey(k); resetState(); }} className="mb-3">
        <Tab eventKey="mnemonic" title="By Mnemonic Phrase">
          <p>Generate a new wallet with a 12-word mnemonic phrase.</p>
          <Button onClick={generateMnemonicWallet} variant="success" className="mb-3">Generate Mnemonic</Button>
          {newWallet && !keystoreJson && (
            <Card>
              <Card.Header as="h5">Your New Wallet</Card.Header>
              <Card.Body>
                <Alert variant="warning">
                  <strong>IMPORTANT:</strong> Store this phrase securely. Anyone with this phrase can access your funds. We do not store it for you.
                </Alert>
                <Card.Text><strong>Mnemonic Phrase:</strong></Card.Text>
                <InputGroup className="mb-3">
                    <Form.Control as="textarea" readOnly value={newWallet.mnemonic.phrase} rows={2} style={{ resize: 'none' }}/>
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(newWallet.mnemonic.phrase)}>Copy</Button>
                </InputGroup>
                
                <Card.Text><strong>Your Public Key</strong></Card.Text>
                <InputGroup className="mb-3">
                    <Form.Control as="textarea" rows={3} style={{ resize: 'none' }} readOnly value={newWallet.publicKey.substring(2)} />
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(newWallet.publicKey.substring(2))}>Copy</Button>
                </InputGroup>
              </Card.Body>
            </Card>
          )}
        </Tab>

        <Tab eventKey="keystore" title="By Keystore File">
          <p>Generate an encrypted keystore file protected by a password.</p>
          <Form onSubmit={generateKeystoreWallet}>
            <Form.Group className="mb-3">
              <Form.Label>Choose a strong password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password (min 8 characters)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Generating...
                </>
              ) : 'Generate Keystore'}
            </Button>
          </Form>

          {newWallet && keystoreJson && (
             <Card className="mt-4">
                <Card.Header as="h5">Your New Wallet & Keystore File</Card.Header>
                <Card.Body>
                    <Alert variant="warning">
                        <strong>IMPORTANT:</strong> Do not lose this file or your password. They are not recoverable.
                    </Alert>
                    <Button onClick={downloadKeystore} variant="success">Download Keystore File</Button>
                    <hr/>
                    <Card.Text><strong>Your Public Key</strong></Card.Text>
                    <InputGroup className="mb-3">
                        <Form.Control as="textarea" rows={3} style={{ resize: 'none' }} readOnly value={newWallet.publicKey.substring(2)} />
                        <Button variant="outline-secondary" onClick={() => copyToClipboard(newWallet.publicKey.substring(2))}>Copy</Button>
                    </InputGroup>
                </Card.Body>
             </Card>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default CreateWallet;