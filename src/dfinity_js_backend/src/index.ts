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
    Duration,
    Result,
    bool,
    Canister,
    init,
  } from "azle";
  import {
    Ledger,
    binaryAddressFromAddress,
    binaryAddressFromPrincipal,
    hexAddressFromPrincipal,
  } from "azle/canisters/ledger";
  //@ts-ignore
  import { hashCode } from "hashcode";
  import { v4 as uuidv4 } from "uuid";

const AccountType = Variant({
    personal: text,
    business: text,
  });
const TransactionType = Variant({
    deposit: text,
    withdrawal: text,
    transfer: text
  });

const Transaction = Record({
    id: text,
    type: TransactionType,
    amount: nat64,
    spender: Opt(Principal),
    from: Principal,
    to: Opt(Principal)
});
const Account = Record({
    id: text,
    name: text,
    balance: nat64,
    owner: Principal,
    accountType: AccountType,
    spenders: Vec(Principal),
    transactions: Vec(Transaction)
});
  
const AccountPayload = Record({
    name: text,
    spenders: Opt(Vec(Principal)),
    accountType: AccountType
  });
   
  const Message = Variant({
    NotFound: text,
    NotOwner: text,
    InvalidPayload: text,
    PaymentFailed: text,
    PaymentCompleted: text,
  });
  
  const accountsStorage = StableBTreeMap(0, text, Account);

  let admin: typeof Principal;
  
  /* 
      initialization of the Ledger canister. The principal text value is hardcoded because 
      we set it in the `dfx.json`
  */
  const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));
  
  export default Canister({
  initAdmin: init([], () => {
    admin = ic.caller();
  }),
  getAccount: query([text], Result(Account, Message), (id) => {
    const accountOpt = accountsStorage.get(id);
    if ("None" in accountOpt) {
      return Err({ NotFound: `Account with id=${id} not found` });
    }
    if (accountOpt.Some.owner.toString() !== ic.caller().toString()) {
        return Err({NotOwner: `${ic.caller()} is not the owner of this account.`})
    }
    return Ok(accountOpt.Some);
  }),
    createAccount: update([AccountPayload], Result(Account, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
          return Err({ NotFound: "invalid payoad" });
        }
        const account = {
          id: uuidv4(),
          owner: ic.caller(),
          transactions: [],
          balance: 0,
          ...payload,
        };
        accountsStorage.insert(account.id, account);
        return Ok(account);
      }),

  });
  
  /*
      a hash function that is used to generate correlation ids for orders.
      also, we use that in the verifyPayment function where we check if the used has actually paid the order
  */
  function hash(input: any): nat64 {
    return BigInt(Math.abs(hashCode().value(input)));
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
  
  // to process refund of reservation fee to users.
  async function makePayment(address: Principal, amount: nat64) {
    const toAddress = hexAddressFromPrincipal(address, 0);
    const transferFeeResponse = await ic.call(icpCanister.transfer_fee, {
      args: [{}],
    });
    const transferResult = ic.call(icpCanister.transfer, {
      args: [
        {
          memo: 0n,
          amount: {
            e8s: amount - transferFeeResponse.transfer_fee.e8s,
          },
          fee: {
            e8s: transferFeeResponse.transfer_fee.e8s,
          },
          from_subaccount: None,
          to: binaryAddressFromAddress(toAddress),
          created_at_time: None,
        },
      ],
    });
    if ("Err" in transferResult) {
      return Err({ PaymentFailed: `refund failed, err=${transferResult.Err}` });
    }
    return Ok({ PaymentCompleted: "refund completed" });
  }
  
  function generateCorrelationId(productId: text): nat64 {
    const correlationId = `${productId}_${ic.caller().toText()}_${ic.time()}`;
    return hash(correlationId);
  }
  
  /*
      after the order is created, we give the `delay` amount of minutes to pay for the order.
      if it's not paid during this timeframe, the order is automatically removed from the pending orders.
  */
  function discardByTimeout(memo: nat64, delay: Duration) {
    ic.setTimer(delay, () => {
      const order = pendingOrders.remove(memo);
      console.log(`Order discarded ${order}`);
    });
  }
  
  async function verifyPaymentInternal(
    sender: Principal,
    amount: nat64,
    block: nat64,
    memo: nat64
  ): Promise<bool> {
    const blockData = await ic.call(icpCanister.query_blocks, {
      args: [{ start: block, length: 1n }],
    });
    const tx = blockData.blocks.find((block) => {
      if ("None" in block.transaction.operation) {
        return false;
      }
      const operation = block.transaction.operation.Some;
      const senderAddress = binaryAddressFromPrincipal(sender, 0);
      const receiverAddress = binaryAddressFromPrincipal(ic.id(), 0);
      return (
        block.transaction.memo === memo &&
        hash(senderAddress) === hash(operation.Transfer?.from) &&
        hash(receiverAddress) === hash(operation.Transfer?.to) &&
        amount === operation.Transfer?.amount.e8s
      );
    });
    return tx ? true : false;
  }