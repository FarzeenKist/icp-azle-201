import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
const BANK_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";

export async function approve(amount) {
    const canister = window.canister.ledger;
    const result = await canister.icrc2_approve({
        from_subaccount: [],
        spender: {
            owner: Principal.fromText(BANK_CANISTER_ID),
            subaccount: []
        },
        amount: amount,
        expected_allowance: [], 
        expires_at: [], 
        fee: [],
        memo: [],
        created_at_time: []
    });
    return result.Ok;
}
export async function getBankAllowance() {
    const canister = window.canister.ledger;
    const result = await canister.icrc2_allowance({
        account: {
            owner: window.auth.principal,
            subaccount: []
        },
        spender: {
            owner: Principal.fromText(BANK_CANISTER_ID),
            subaccount: []
        },
    });
    return (result.allowance / BigInt(10**8)).toString();
}

export async function balance() {
    const canister = window.canister.ledger;
    const address = await window.canister.bank.getAddressFromPrincipal(window.auth.principal);
    console.log(address)
    const balance = await canister.account_balance_dfx({account: address});
    return (balance?.e8s / BigInt(10**8)).toString();
}
