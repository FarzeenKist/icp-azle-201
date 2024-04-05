import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Card } from "react-bootstrap";

const Transfer = ({ handleTransferFrom, show, onHide }) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);
  const isFormFilled = () => to && amount > 0


  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Make a Transfer
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="receiver">
            <Form.Label>To</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the principal of the transfer receiver"
              onChange={(e) => {
                setTo(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="requestAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the transfer amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="outline-dark"
            type="button"
            disabled={!isFormFilled()}
            onClick={() => {
              handleTransferFrom({
                to,
                amount,
              });
            }}
          >
            Transfer
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

Transfer.propTypes = {
  handleTransferFrom: PropTypes.func.isRequired,
};

export default Transfer;
