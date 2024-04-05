export async function createAccount() {
  return window.canister.bank.createAccount();
}
export async function createTransferRequest(request) {
  return window.canister.bank.createTransferRequest(request);
}

export async function handleTransferRequest(requestId, canTransfer) {
  return window.canister.bank.handleTransferRequest(requestId, canTransfer);
}

export async function transferFrom(to, amount) {
  let transferFromArgs = {
    spender_subaccount: [],
    from: {
      owner: window.auth.principal,
      subaccount: []
    },
    to: {
      owner: to,
      subaccount: []
    },
    amount: amount,
    fee: [],
    memo: [],
    created_at_time: []
}
  return window.canister.bank.transferFrom(transferFromArgs);
}

async function getRequest(requestId) {
  try {
    return await window.canister.bank.getRequest(requestId);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}
export async function isRegistered() {
  try {
    return await window.canister.bank.isRegistered(window.auth.principal);
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}
export async function getAccount() {
  try {
    let result = await window.canister.bank.getAccount();
    if(result.Err){
      return;
    }else{
      return result.Ok;
    }
  } catch (err) {
    if (err.name === "AgentHTTPResponseError") {
      const authClient = window.auth.client;
      await authClient.logout();
    }
    return [];
  }
}

export const getCallerRequests = async(requestIds) => {
  const requests = [];
		const requestsLength = requestIds.length;
		for (let i = 0; i < requestsLength; i++) {
			const request = new Promise(async (resolve) => {
				const res = await getRequest(requestIds[i]);
				console.log(res)
        if (res.Ok){
          const request = res.Ok
          resolve({
            id: request.id,
            requester: request.requester,
            receiver: request.receiver,
            amount: request.amount,
            approved: request.approved,
            transactionId: request.transactionId,
          });
        }else{
          const error = {
            id: requestIds[i],
            message: `Request with id=${requestIds[i]} not found.`
          }
          reject(error)
        }
			});
			requests.push(request);
		}
		return Promise.all(requests);
}