import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import { Container } from 'react-bootstrap';

const Layout = () => {
  return (
    <>
      <AppNavbar />
      <main>
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export default Layout;