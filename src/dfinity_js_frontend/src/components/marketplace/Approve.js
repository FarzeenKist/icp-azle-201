import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Card } from "react-bootstrap";

const Approve = ({ approve, show, onHide }) => {
  const [amount, setAmount] = useState(0);
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
          Approve Bank Canister
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="requestAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the approve amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="outline-dark"
            type="button"
            disabled={amount <= 0}
            onClick={() => {
              approve(amount);
            }}
          >
            Approve
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

Approve.propTypes = {
  approve: PropTypes.func.isRequired,
};

export default Approve;
