import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-5 mb-4 bg-light rounded-3 text-center">
      <Container fluid className="py-5">
        <h1 className="display-5 fw-bold">Welcome to MyCoin</h1>
        <p className="fs-4">
          A simple, secure, and open-source cryptocurrency wallet.
        </p>
        <hr className="my-4" />
        <p>
          Create a new wallet, access your existing one, or browse the blockchain.
        </p>
        <Link to="/create-wallet" className="btn btn-success btn-lg me-2 mb-2">
          Create New Wallet
        </Link>
        <Link to="/access-wallet" className="btn btn-secondary btn-lg me-2 mb-2">
          Access My Wallet
        </Link>
        <Link to="/explorer" className="btn btn-outline-dark btn-lg mb-2">
          Blockchain Explorer
        </Link>
      </Container>
    </div>
  );
}

export default Home;