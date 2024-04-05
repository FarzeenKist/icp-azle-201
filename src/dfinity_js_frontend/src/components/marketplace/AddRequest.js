import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Card } from "react-bootstrap";

const AddRequest = ({ addRequest, show, onHide }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState(0);
  const isFormFilled = () => receiver && amount > 0

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
          Create Transfer Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="receiver">
            <Form.Label>Receiver</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the principal of the receiver"
              onChange={(e) => {
                setReceiver(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="requestAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0.5"
              placeholder="Enter the request's amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="outline-dark"
            type="button"
            disabled={!isFormFilled()}
            onClick={() => {
              addRequest({
                receiver,
                amount,
              });
            }}
          >
            Request Transfer
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

AddRequest.propTypes = {
  addRequest: PropTypes.func.isRequired,
};

export default AddRequest;
