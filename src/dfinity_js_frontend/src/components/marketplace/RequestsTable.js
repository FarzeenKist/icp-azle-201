import { useState } from "react";
import Table from "react-bootstrap/Table";

function RequestsTable({ requests, onHide, show, handleTransferRequest }) {
  const [handleRequest, setHandleRequest] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [canTransfer, setCanTransfer] = useState(false);

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
          Transfer Requests
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {handleRequest ? (
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
              <Form.Select onChange={(e) => setCanTransfer(e.target.value)}>
              <option value="true">Yes</option>
                <option value="false" selected>No</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="outline-dark"
              type="button"
              disabled={requestId}
              onClick={() => {
                handleTransferRequest(requestId, canTransfer);
              }}
            >
              Handle Request
            </Button>
          </Form>
        ) : (
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
              {requests.map((request) => {
                // This will displays the error message and the id for a request that couldn't be fetched
                // otherwise the request's data is displayed
                {
                  if (request.message) {
                    <tr>
                      <td>{request.id}</td>
                      <td colSpan={5}>{request.message}</td>
                    </tr>;
                  } else {
                    <tr>
                      <td>{request.id}</td>
                      <td>{request.transactionType}</td>
                      <td>{request.from}</td>
                      <td>{request.to}</td>
                      <td>{request.spender}</td>
                      <td>{request.amount}</td>
                    </tr>;
                  }
                }
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={setHandleRequest((prevHandleRequest) => !prevHandleRequest)}
        >
          {handleRequest ? "Show requests" : "Handle a request"}
        </Button>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RequestsTable;
