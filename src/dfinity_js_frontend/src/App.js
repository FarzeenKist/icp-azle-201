import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import Bank from "./components/marketplace/Bank";
import "./App.css";
import Wallet from "./components/Wallet";
import { login, logout as destroy } from "./utils/auth";
import { balance as principalBalance, getBankAllowance } from "./utils/ledger";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";
// import SideBar from "./components/marketplace/sidebar";

const App = function AppWrapper() {
  const isAuthenticated = window.auth.isAuthenticated;
  const principal = window.auth.principalText;
  const name = "Bank dApp";

  const [balance, setBalance] = useState("0");
  const [approveBalance, setApproveBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (isAuthenticated) {
      setBalance(await principalBalance());
    }
  });
  const getApproveBalance = useCallback(async () => {
    if (isAuthenticated) {
      setApproveBalance(await getBankAllowance());
      console.log(approveBalance)
    }
  });

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  useEffect(() => {
    getApproveBalance();
  }, [getApproveBalance]);
  return (
    <>
      <Notification />
      {isAuthenticated ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              <Wallet
                principal={principal}
                balance={balance}
                symbol={"ICP"}
                isAuthenticated={isAuthenticated}
                destroy={destroy}
                approveBalance={approveBalance}
              />
            </Nav.Item>
          </Nav>
          <main>
            <Bank name={name} getApproveBalance={getApproveBalance} getBalance={getBalance} />
          </main>
        </Container>
      ) : (
        <Cover name={name} login={login} />
      )}
    </>
  );
};

export default App;
