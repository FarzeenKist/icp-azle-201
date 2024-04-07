import { useState } from "react";
import Table from "react-bootstrap/Table";
import React from "react";
import { Modal, Button } from "react-bootstrap";

function RequestsTable({ requests, onHide, show }) {
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

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Receiver</th>
                <th>Approved</th>
                <th>Amount</th>
                <th>transactionId</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={`${request}-${index}`}>
                  <td>{request.id}</td>
                  <td>{request.requester.toText()}</td>
                  <td>{request.receiver.toText()}</td>
                  <td>
                    {request.approved.length ? request.approved[0] ? "Yes" : "No" : "-------"}
                  </td>
                  <td>{request.amount.toString()}</td>
                  <td>
                    {request.transactionId.length
                      ? request.transactionId
                      : "-------"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RequestsTable;
