import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Header() {
  return (
    <Navbar bg="black" variant="dark" style={{ margin: '0 0 50px'}}>
      <Container>
        <Navbar.Brand href="/" style={{ fontSize: "40px"}} >MathDown</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" style={{color: "#eee"}}>数学・理科のノート作成に
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}