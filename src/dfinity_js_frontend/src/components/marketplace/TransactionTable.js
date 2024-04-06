import Table from "react-bootstrap/Table";
import React from "react";
import { Modal, Button } from "react-bootstrap";

function TransactionTable({ transactions, onHide, show }) {
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
          Transaction History
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Transaction Type</th>
              <th>From</th>
              <th>To</th>
              <th>Spender</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={`${transaction}-${index}`}>
                <td>{transaction.id}</td>
                <td>{transaction.transactionType[Object.keys(transaction.transactionType)[0]]}</td>
                <td>{transaction.from.toString()}</td>
                <td>{transaction.to.toString()}</td>
                <td>{transaction.spender.toString()}</td>
                <td>{transaction.amount.toString()}</td>
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

export default TransactionTable;
