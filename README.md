

## Deploying All Canisters

To deploy all canisters, follow these steps:

```bash
# Start DFX
dfx start --background --clean

# Deploy Ledger Canister
./deploy-local-ledger.sh

# Deploy Internet Identity
dfx deploy internet_identity

# Deploy Bank Canister
dfx deploy dfinity_js_backend

# Deploy Frontend Canister
dfx deploy dfinity_js_frontend

# Transfer Tokens to Principal used on the frontend
dfx identity use default
dfx ledger transfer <ADDRESS>  --memo 0 --icp 100
```

Replace `<ADDRESS>` with the address of the recipient. To get the address from the principal, you can use the helper function from the marketplace canister - `getAddressFromPrincipal(principal: Principal)` or it will be logged in the console of the frontend upon successfully connecting your wallet.
