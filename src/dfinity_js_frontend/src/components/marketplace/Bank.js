import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddRequest from "./AddRequest";
import CreateAccount from "./CreateAccount";
import Loader from "../utils/Loader";
import { Row, Button, Container, Col } from "react-bootstrap";
import Transfer from "./Transfer";
import Approve from "./Approve";
import { Principal } from "@dfinity/principal";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import HandleTransfer from "./HandleTransfer";
import {
  createTransferRequest,
  getCallerRequests,
  isRegistered as fetchIsRegistered,
  getAccount as fetchAccount,
  handleTransferRequest as transferRequest,
  transferFrom,
  createAccount as register,
} from "../../utils/marketplace";
import { approve } from "../../utils/ledger";
import TransactionTable from "./TransactionTable";
import RequestsTable from "./RequestsTable";

const Bank = ({ name, getBalance, balance, getApproveBalance, approveBalance }) => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [requests, setRequests] = useState(null);
  const [registered, setRegistered] = useState(null);

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransferRequests, setShowTransferRequests] = useState(false);
  const [showHandleTransfer, setShowHandleTransfer] = useState(false);

  const getRequests = useCallback(async () => {
    try {
      setLoading(true)
      setRequests(await getCallerRequests());
    } catch (error) {
      console.log({ error });
    }finally{
      setLoading(false)
    }
  });

  const getAccount = useCallback(async () => {
    try {
      setAccount(await fetchAccount());
    } catch (error) {
      console.log({ error });
    }
  });
  const getRegistered = useCallback(async () => {
    try {
      setRegistered(await fetchIsRegistered());
    } catch (error) {
      console.log({ error });
    }
  });

  const addRequest = async (data) => {
    try {
      setLoading(true);
      data.receiver = Principal.fromText(data.receiver);
      data.amount = data.amount * 10 ** 8;
      createTransferRequest(data).then((resp) => {
        getAccount();
        getRequests()
      });
      toast(
        <NotificationSuccess text="Transfer request added successfully." />
      );
    } catch (error) {
      console.log({ error });
      toast(
        <NotificationError
          text={`Failed to create a request. ${error.message}`}
        />
      );
    } finally {
      setLoading(false);
    }
  };
  const createAccount = async () => {
    try {
      setLoading(true);
      register().then((resp) => {
        getRegistered();
      });
      toast(<NotificationSuccess text="Account created successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text={`Failed to create account.`} />);
    } finally {
      setLoading(false);
    }
  };
  const approveAmount = async (amount) => {
    try {
      setLoading(true);
      amount = amount * 10 ** 8;
      if(balance < amount){
        toast(<NotificationError text="Amount to approve can't exceed current balance." />);
        return;
      }
      approve(amount).then((resp) => {
        getAccount();
        getApproveBalance();
        getBalance();
      });
      toast(
        <NotificationSuccess
          text={`Amount successfully approved for Bank Canister.`}
        />
      );
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to approve amount." />);
    } finally {
      setLoading(false);
    }
  };
  const handleTransferFrom = async ({ to, amount }) => {
    try {
      setLoading(true);
      if(amount > approveAmount){
        toast(<NotificationError text="Amount can't exceeds the bank canister's current approved amount." />);
        return;
      }
      to = Principal.fromText(to);
      amount = amount * 10 ** 8;
      transferFrom(to, amount).then((resp) => {
        getAccount();
        getApproveBalance();
        getBalance();
      });
      toast(<NotificationSuccess text={`Tokens transferred successfully.`} />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to transfer tokens." />);
    } finally {
      setLoading(false);
    }
  };
  const handleTransferRequest = async ({ requestId, canTransfer }) => {
    try {
      setLoading(true);
      const request = requests.find(request => request.id == requestId);
      if(parseInt(request.amount.toString()) > approveAmount){
        toast(<NotificationError text="Amount can't exceeds the bank canister's current approved amount." />);
        return;
      }
      transferRequest(requestId, canTransfer).then((resp) => {
        getAccount();
        getApproveBalance();
        getBalance();
      });
      toast(
        <NotificationSuccess text="Transfer request handled successfully." />
      );
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to handle transfer request." />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRegistered();
  }, [getRegistered]);
  useEffect(() => {
    if (registered) {
      getAccount();
    }
  }, [registered]);

  useEffect(() => {
    if(account && account.transferRequests.length){
      getRequests();
    }

  }, [account]);

  return (
    <>
      {!loading ? (
        registered ? (
          <>
            <h1 className="fs-4 fw-bold mb-5">BankdApp</h1>
            <Container className="d-flex justify-content-center align-items-center mx-5">
              <Row>
                <Col>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddRequest(true)}
                  >
                    Create Transfer Request
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="primary"
                    onClick={() => setShowTransferModal(true)}
                  >
                    Make Transfer
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="primary"
                    onClick={() => setShowApproveModal(true)}
                  >
                    Approve Bank Canister
                  </Button>
                </Col>
                {account && account.transactions.length ? (
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => setShowTransactionModal(true)}
                    >
                      Show Transaction History
                    </Button>
                  </Col>
                ) : (
                  ""
                )}
                {account && account.transferRequests.length ? (
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => setShowTransferRequests(true)}
                    >
                      Show Transfer Requests
                    </Button>
                  </Col>
                ) : (
                  ""
                )}
                {account && account.transferRequests.length ? (
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => setShowHandleTransfer(true)}
                    >
                      Handle Transfer
                    </Button>
                  </Col>
                ) : (
                  ""
                )}
              </Row>

              <AddRequest
                addRequest={addRequest}
                show={showAddRequest}
                onHide={() => setShowAddRequest(false)}
              />
              <Transfer
                handleTransferFrom={handleTransferFrom}
                show={showTransferModal}
                onHide={() => setShowTransferModal(false)}
              />
              <Approve
                approve={approveAmount}
                show={showApproveModal}
                onHide={() => setShowApproveModal(false)}
              />
              {account && account.transactions.length ? (
                <TransactionTable
                  transactions={account.transactions}
                  show={showTransactionModal}
                  onHide={() => setShowTransactionModal(false)}
                />
              ) : (
                ""
              )}

              {showTransferRequests? (
                <RequestsTable
                  show={showTransferRequests}
                  onHide={() => setShowTransferRequests(false)}
                  requests={requests}
                />
              ) : (
                ""
              )}
              {showHandleTransfer? (<HandleTransfer handleTransferRequest={handleTransferRequest} show={setShowHandleTransfer} onHide={() => setShowHandleTransfer(false)} />) : ""}
            </Container>
          </>
        ) : (
          <CreateAccount name={name} createAccount={createAccount} />
        )
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Bank;
