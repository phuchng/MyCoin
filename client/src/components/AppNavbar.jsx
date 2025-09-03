import { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../WalletContext';

function AppNavbar() {
  const { wallet, setWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setWallet(null);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">MyCoin Wallet</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {wallet && <Nav.Link as={Link} to="/wallet">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {!wallet ? (
              <>
                <Nav.Link as={Link} to="/create-wallet" className="d-lg-none">
                  Create Wallet
                </Nav.Link>
                <Nav.Link as={Link} to="/access-wallet" className="d-lg-none">
                  Access Wallet
                </Nav.Link>
                <div className="d-none d-lg-flex">
                  <Button variant="outline-success" as={Link} to="/create-wallet" className="me-2">
                    Create Wallet
                  </Button>
                  <Button variant="success" as={Link} to="/access-wallet">
                    Access Wallet
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;