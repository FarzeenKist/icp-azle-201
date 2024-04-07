## Description

This project allows users to perform transfers, create requests for transfers from other users, view their transaction history and transfer request history.

### isRegistered Function
This function is used to verify whether a Principal has an account. It is used multiple times across the project to perform both  the conditional rendering between the createAccount form and the user interface and to also perform an input validation check for the receiver of a transfer request.

### getAccount Function
This function is used to fetch the account data of the caller.
### getCallerRequests Function
This function is used to fetch all the requests of the caller.
### getCanisterId Function
This function is used to fetch the id of the backend/bank canister.
### createAccount Function
This function allows the caller to create an account only if the later doesn't already have one.
### createTransferRequest Function
This function allows the caller to create a transfer request to another user. It is required for both the requester and receiver of a request to have an account.
### handleTransferRequest Function
This function allows the receiver of a transfer request to handle a transfer request. They can either reject or approve the request. If approved, the amount is transferred to the requester and a transaction is stored for both.
### transferFrom Function
This function allows the caller to transfer tokens to a Principal. Only the caller is required to have an account.
### handleGetFee Function
This function fetches the current fee of the ledger canister.
### handleGetAllowance Function
This function fetches the current allowance of the backend/bank canister for the `account`.
### handleTransferFrom Function
This function carries out the transferFrom operation which is used across the handleTransferRequest and transferFrom functions of the bank/backend canister.


## Deploying All Canisters

To deploy all canisters, follow these steps:

```bash
# Start DFX
dfx start --background --clean

# Deploy Ledger Canister
./deploy-local-ledger.sh

# Deploy Internet Identity
dfx deploy internet_identity

# Generate types declarations
dfx generate dfinity_js_backend

# Deploy Bank Canister
dfx deploy dfinity_js_backend

# Deploy Frontend Canister
dfx deploy dfinity_js_frontend

# Transfer Tokens to Principal used on the frontend
dfx identity use default
dfx ledger transfer <ADDRESS>  --memo 0 --icp 100
```

Replace `<ADDRESS>` with the address of the recipient. To get the address from the principal, you can use the helper function from the marketplace canister - `getAddressFromPrincipal(principal: Principal)` or it will be logged in the console of the frontend upon successfully connecting your wallet.
