import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismClient } from "../optimismClient";
import { readContract } from "viem/actions";

const ID_REGISTRY_ADDRESS = '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b'

export async function getFidFromPrivateKey(params: { privateKey: Hex }) {
  const account = privateKeyToAccount(params.privateKey)
  const fid = await readContract(optimismClient, {
    address: ID_REGISTRY_ADDRESS,
    abi: [{ "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "idOf", "outputs": [{ "internalType": "uint256", "name": "fid", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
    functionName: 'idOf',
    args: [account.address]
  })
  return fid
}
