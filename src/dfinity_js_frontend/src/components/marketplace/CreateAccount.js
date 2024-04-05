import React from "react";
import { Button } from "react-bootstrap";
const CreateAccount = ({name, createAccount}) => {
    return (
      <div
        className="d-flex justify-content-center flex-column text-center "
        style={{ background: "#000", minHeight: "100vh" }}
      >
        <div className="mt-auto text-light mb-5">
          <div
            className=" ratio ratio-1x1 mx-auto mb-2"
            style={{ maxWidth: "320px" }}
          >
          </div>
          <h1>Welcome to {name}</h1>
          <p>Please register to continue.</p>
          <Button
            onClick={createAccount}
            variant="outline-light"
            className="rounded-pill px-3 mt-3"
          >
            Create Account
          </Button>
        </div>
        <p className="mt-auto text-secondary">Powered by Internet Computer</p>
      </div>
    );
};


export default CreateAccount;
