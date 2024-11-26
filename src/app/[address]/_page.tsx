'use client'
import { Address, erc20Abi, formatEther, getAddress, Hex, parseEther } from "viem";
import { useGetPoolDataQuery } from "./hooks/useGetPoolDataQuery";
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { useGetTradeDetailsQuery } from "./hooks/useGetTradeDetailsQuery";

export default function SwapPage(props: {address: string}) {
  const poolAddress = getAddress( props.address)

  const account = useAccount()
  const [amountInRaw, setAmountInRaw]= useState('0.0001')
  const amountIn = (() => {
    try {
      return parseEther(`${Number(amountInRaw || 1)}`)
    }
    catch {
      return 10000000000000000n
    }
  })()

  const getGetPoolDataQuery = useGetPoolDataQuery({address: poolAddress})
  const getTradeDetailsQuery = useGetTradeDetailsQuery(getGetPoolDataQuery.isSuccess ? {...getGetPoolDataQuery.data, amountIn, slippageTolerance: 20, recipient: account.address} : undefined)

    console.log(getGetPoolDataQuery.error)
  const tokenSymbolQuery = useReadContract(getGetPoolDataQuery.data? {abi: erc20Abi, functionName: 'symbol', address: getGetPoolDataQuery.data.token.address as Address}:undefined)
  const sendTransactionMutation = useSendTransaction()
  const waitForTransactionReceiptQuery = useWaitForTransactionReceipt({hash: sendTransactionMutation.data})

  if (!getGetPoolDataQuery.isSuccess) return <>Loading pool data..</>
  if (!tokenSymbolQuery.isSuccess) return <>Loading token symbol...</>


  return <div>
    <h2>Swap WETH to {tokenSymbolQuery.data}</h2>
    <input className="text-black" value={amountInRaw} onChange={(e) => setAmountInRaw(e.target.value)}/>
    {getTradeDetailsQuery.isSuccess?
      <p>You receive {formatEther(getTradeDetailsQuery.data.amountOut)} {tokenSymbolQuery.data}</p>
      :
      <p>Loading the output amount</p>
    }
    
    <button disabled={getTradeDetailsQuery.isLoading || waitForTransactionReceiptQuery.isLoading} onClick={() => {
      if (!getTradeDetailsQuery.isSuccess) throw new Error('Must never be called here')
sendTransactionMutation.sendTransaction({to: '0x2626664c2603336E57B271c5C0b26F421741e481',value: BigInt(getTradeDetailsQuery.data.parameters.value), data: getTradeDetailsQuery.data.parameters.calldata as Hex})
    }}>Swap</button>
    {waitForTransactionReceiptQuery.isSuccess && <p>Swapped: <a href={`https://basescan.org/tx/${waitForTransactionReceiptQuery.data.transactionHash}`} target="_blank">{waitForTransactionReceiptQuery.data.transactionHash}</a></p>}
  </div>
}
