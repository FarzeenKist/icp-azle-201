import Table from "react-bootstrap/Table";

function TransactionTable({ transactions, onHide, show }) {
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
            {transactions.map((transaction) => {
              <tr>
                <td>{transaction.id}</td>
                <td>{transaction.transactionType}</td>
                <td>{transaction.from}</td>
                <td>{transaction.to}</td>
                <td>{transaction.spender}</td>
                <td>{transaction.amount}</td>
              </tr>;
            })}
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
