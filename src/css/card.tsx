import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import NoteImage from "./../assets/react.svg";
import { Link } from "react-router-dom";

function SelectCard() {
  return (
    <Row xs={1} md={2} className="g-2">
      <Col key="1">
        <Card style={{ height: "100%" }}>
          <Card.Body>
            <Link to="/importPDF">
              <Card.Img
                src={NoteImage}
                style={{ margin: "0 0 30px" }}
              ></Card.Img>
            </Link>
            <Card.Title>ノートを作成する</Card.Title>
            <Card.Text>
              簡単に数式を用いたわかりやすいノートを作成することができます。
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col key="2">
        <Card style={{ height: "100%" }}>
          <Card.Body>
            <Link to="/importPDF">
              <Card.Img
                src={NoteImage}
                style={{ margin: "0 0 30px" }}
              ></Card.Img>
            </Link>
            <Card.Title>講義資料をアップロード</Card.Title>
            <Card.Text>
              講義資料に様々な便利機能を追加することができます。
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default SelectCard;
