import {
  query,
  update,
  text,
  Record,
  StableBTreeMap,
  Variant,
  Vec,
  None,
  Some,
  Ok,
  Err,
  ic,
  Principal,
  Opt,
  nat64,
  Result,
  bool,
  Canister,
  Duration,
  nat,
} from "azle";
import {
  Account,
  ICRC,
  TransferFromArgs,
  AllowanceResult,
  TransferFromResult
} from "azle/canisters/icrc";
import {hexAddressFromPrincipal } from "azle/canisters/ledger";
//@ts-ignore
import { v4 as uuidv4 } from "uuid";
const TransactionType = Variant({
  approvedRequests: text,
  transfer: text,
});

const Transaction = Record({
  id: text,
  transactionType: TransactionType,
  amount: nat,
  spender: Opt(Principal),
  from: Opt(Principal),
  to: Opt(Principal),
});
const Request = Record({
  id: text,
  requester: Principal,
  receiver: Principal,
  amount: nat,
  approved: Opt(bool),
  transactionId: Opt(text),
});
const AccountData = Record({
  owner: Principal,
  transactions: Vec(Transaction),
  transferRequests: Vec(text),
});
const RequestPayload = Record({
  receiver: Principal,
  amount: nat,
});

const Message = Variant({
  NotFound: text,
  NotOwner: text,
  InvalidPayload: text,
  ApproveRequestFailed: text,
  AlreadyRegistered: text,
  TransferFromFailed: text,
});

const accountsStorage = StableBTreeMap(0, Principal, AccountData);
const requestsStorage = StableBTreeMap(1, text, Request);

let icrc: typeof ICRC = ICRC(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

const REQUEST_VALIDITY_PERIOD = 120n; // in seconds

export default Canister({
  getAccount: query([], Result(AccountData, Message), () => {
    const caller = ic.caller();
    const accountOpt = accountsStorage.get(caller);
    if ("None" in accountOpt) {
      return Err({ NotFound: `Account with id=${caller} not found` });
    }
    return Ok(accountOpt.Some);
  }),
  isRegistered: query([Principal], bool, (user) => {
    return accountsStorage.containsKey(user);
  }),
  getRequest: query([text], Result(Request, Message), (requestId) => {
    const requestOpt = requestsStorage.get(requestId);
    if ("None" in requestOpt) {
      return Err({ NotFound: `Request with id=${requestId} not found` });
    }
    return Ok(requestOpt.Some);
  }),
  getCallerRequests: query([], Result(Vec(Request), Message), () => {
    const caller = ic.caller();
    const accountOpt = accountsStorage.get(caller);
    if ("None" in accountOpt) {
      return Err({ NotFound: `Account with id=${caller} not found` });
    }
    const transferRequestsIds = accountOpt.Some.transferRequests;
    const requestsLength = transferRequestsIds.length;
    const requests = [];
    for(let i = 0; i < requestsLength; i++){
      const requestOpt = requestsStorage.get(transferRequestsIds[i]);
      if ("None" in requestOpt) {
        continue;
      }
      requests.push(requestOpt.Some)
    }

    return Ok(requests);
  }),
  /*
        a helper function to get address from the principal
        the address is later used in the transfer method
    */
  getAddressFromPrincipal: query([Principal], text, (principal) => {
    return hexAddressFromPrincipal(principal, 0);
  }),
  getCanisterId: query([], Principal, () => {
    return ic.id();
  }),
  createAccount: update([], Result(AccountData, Message), () => {
    const caller = ic.caller();
    if (accountsStorage.containsKey(caller)) {
      return Err({ AlreadyRegistered: `${caller} already has an account.` });
    }
    const account = {
      owner: caller,
      transactions: [],
      transferRequests: [],
    };
    accountsStorage.insert(caller, account);
    return Ok(account);
  }),
  createTransferRequest: update(
    [RequestPayload],
    Result(Request, Message),
    (payload) => {
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "Invalid payload." });
      }
      const caller = ic.caller();
      const accountRequesterOpt = accountsStorage.get(caller);
      if ("None" in accountRequesterOpt) {
        return Err({ NotFound: `Account with id=${caller} not found` });
      }
      const accountReceiverOpt = accountsStorage.get(payload.receiver);
      if ("None" in accountReceiverOpt) {
        return Err({
          NotFound: `Account with id=${payload.receiver} not found`,
        });
      }
      const request = {
        id: uuidv4(),
        requester: caller,
        paid: false,
        transactionId: None,
        approved: None,
        ...payload,
      };
      const updatedRequesterAccount = {
        ...accountRequesterOpt.Some,
        transferRequests: [
          ...accountRequesterOpt.Some.transferRequests,
          request.id,
        ],
      };
      const updatedReceiverAccount = {
        ...accountReceiverOpt.Some,
        transferRequests: [
          ...accountReceiverOpt.Some.transferRequests,
          request.id,
        ],
      };
      accountsStorage.insert(caller, updatedRequesterAccount);
      accountsStorage.insert(payload.receiver, updatedReceiverAccount);
      requestsStorage.insert(request.id, request);
      discardByTimeout(request.id,REQUEST_VALIDITY_PERIOD)
      return Ok(request);
    }
  ),
  handleTransferRequest: update(
    [text, bool],
    Result(Request, Message),
    async (requestId, canTransfer) => {
      const requestOpt = requestsStorage.get(requestId);
      if ("None" in requestOpt) {
        return Err({ NotFound: `Request with id=${requestId} not found` });
      }
      const request = requestOpt.Some;
      if (request.receiver.toString() != ic.caller().toString()) {
        return Err({ NotOwner: `Only receiver can approve the request` });
      }
      if (request.approved) {
        return Err({
          ApproveRequestFailed: `request with id=${requestId} is already approved.`,
        });
      }
      const accountRequesterOpt = accountsStorage.get(request.requester);
      if ("None" in accountRequesterOpt) {
        return Err({
          NotFound: `Account with id=${request.requester} not found`,
        });
      }
      const accountReceiverOpt = accountsStorage.get(request.receiver);
      if ("None" in accountReceiverOpt) {
        return Err({
          NotFound: `Account with id=${request.receiver} not found`,
        });
      }
      if (canTransfer) {
        try {
          let transferFromArgs = {
            spender_subaccount: None,
            from: { owner: request.receiver, subaccount: None },
            to: { owner: request.requester, subaccount: None },
            amount: request.amount,
            fee: None,
            memo: None,
            created_at_time: Some(ic.time()),
          };
          const transferFromTx = await handleTransferFrom(transferFromArgs);

          let transaction = {
            id: uuidv4(),
            transactionType: { approvedRequests: "APPROVED_REQUEST" },
            amount: transferFromArgs.amount,
            spender: Some(ic.id()),
            from: Some(request.receiver),
            to: Some(request.requester),
          };
          request.approved = Some(true);
          request.transactionId = Some(transaction.id);
          requestsStorage.insert(request.id, request);

          const accountRequester = accountRequesterOpt.Some;
          const accountReceiver = accountReceiverOpt.Some;
          accountRequester.transactions.push(transaction);
          accountReceiver.transactions.push(transaction);
          accountsStorage.insert(accountRequester.owner, accountRequester);
          accountsStorage.insert(accountReceiver.owner, accountReceiver);
          return Ok(request);
        } catch (e) {
          return Err({ TransferFromFailed: `${e}` });
        }
      } else {
        request.approved = Some(false);
        requestsStorage.insert(request.id, request);
        return Ok(request);
      }
    }
  ),
  transferFrom: update(
    [TransferFromArgs],
    Result(AccountData, Message),
    async (transferFromArgs) => {
      const from = transferFromArgs.from.owner;
      if (from.toString() != ic.caller().toString()) {
        return Err({
          NotOwner: `The caller and the from principal needs to be the same.`,
        });
      }
      // maybe try catch and throw/reject
      const accountOpt = accountsStorage.get(from);
      if ("None" in accountOpt) {
        return Err({ NotFound: `Account with id=${from} not found` });
      }
      let account = accountOpt.Some;
      try {
        const transferFromTx = await handleTransferFrom(transferFromArgs);
      } catch (e) {
        return Err({ TransferFromFailed: `${e}` });
      }
      let transaction = {
        id: uuidv4(),
        transactionType: { transfer: "TRANSFER" },
        amount: transferFromArgs.amount,
        spender: Some(ic.id()),
        from: Some(transferFromArgs.from.owner),
        to: Some(transferFromArgs.to.owner),
      };
      account.transactions.push(transaction);
      accountsStorage.insert(from, account);

      if (accountsStorage.containsKey(transferFromArgs.to.owner)) {
        let toAccount = accountsStorage.get(transferFromArgs.to.owner).Some;
        toAccount.transactions.push(transaction);
        accountsStorage.insert(toAccount.owner, toAccount);
      }
      return Ok(account);
    }
  ),
});

/*
    after the order is created, we give the `delay` amount of minutes to pay for the order.
    if it's not paid during this timeframe, the order is automatically removed from the pending orders.
*/
function discardByTimeout(requestId: text, delay: Duration) {
  ic.setTimer(delay, () => {
    const requestOpt = requestsStorage.get(requestId);
    if ("None" in requestOpt) {
      return;
    }
    const request = requestOpt.Some;
    // Requests can only be created if both the requester and the receiver has an account
    // Since there are no mechanism to delete an account, they should always exist
    const accountRequester = accountsStorage.get(request.requester).Some;
    const accountReceiver = accountsStorage.get(request.receiver).Some;
    const requesterTransferIndex = accountRequester.transferRequests.findIndex(
      (request: typeof Request) => request.id.toString() === requestId
    );
    const receiverTransferIndex = accountReceiver.transferRequests.findIndex(
      (request: typeof Request) => request.id.toString() === requestId
    );
    accountReceiver.transferRequests.splice(receiverTransferIndex, 1);
    accountRequester.transferRequests.splice(requesterTransferIndex, 1);

    accountsStorage.insert(accountRequester.owner, accountRequester);
    accountsStorage.insert(accountReceiver.owner, accountReceiver);
    requestsStorage.remove(request.id);
  });
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};

async function handleGetFee(): Promise<nat> {
  return await ic.call(icrc.icrc1_fee, {
    args: [],
  });
}
async function handleGetAllowance(account: Account): Promise<AllowanceResult> {
  const spender = {
    owner: ic.id(),
    subaccount: None,
  };
  return await ic.call(icrc.icrc2_allowance, {
    args: [{ account, spender }],
  });
}
async function handleTransferFrom(
  transferFromArgs: TransferFromArgs
): Promise<TransferFromResult> {
  const allowanceTx = await handleGetAllowance(transferFromArgs.from);
  const fee = await handleGetFee();
  if (transferFromArgs.amount + fee > allowanceTx.allowance) {
    throw "`Allowance is not enough to cover the sum of the transfer amount and the fee.";
  }
  return await ic.call(icrc.icrc2_transfer_from, {
    args: [transferFromArgs],
  });
}
