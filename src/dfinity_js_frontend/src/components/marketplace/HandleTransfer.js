import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
export default function HandleTransfer({handleTransferRequest, show , onHide}) {
  const [requestId, setRequestId] = useState("");
  const [canTransfer, setCanTransfer] = useState(false);
  return (
    <Modal
    show={show}
    onHide={onHide}
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    centered
    className="px-5"
  >
    <Modal.Header closeButton>
      <Modal.Title id="contained-modal-title-vcenter">
        Transfer Requests
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <Form>
      <Form.Group className="mb-3" controlId="requestId">
        <Form.Label>Request ID</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter the ID of the request"
          onChange={(e) => setRequestId(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="canTransfer">
        <Form.Label>canTransfer</Form.Label>
        <Form.Select defaultValue={"false"} onChange={(e) => setCanTransfer(e.target.value === "true" ? true: false)}>
          <option value="true">Yes</option>
          <option value="false">
            No
          </option>
        </Form.Select>
      </Form.Group>
      <Button
        variant="outline-dark"
        type="button"
        disabled={!requestId.trim()}
        onClick={() => {
          handleTransferRequest({requestId, canTransfer});
        }}
      >
        Handle Request
      </Button>
    </Form>
    </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
