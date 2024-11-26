import { Address, erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

export function TokenInfo(props: {address: Address}) {
const result = useReadContracts({ 
  allowFailure: false, 
  contracts: [ 
    { 
      address: props.address, 
      abi: erc20Abi, 
      functionName: 'name', 
    }, 
    { 
      address: props.address, 
      abi: erc20Abi, 
      functionName: 'symbol', 
    }, 
  ] 
})

  if (!result.isSuccess) return <>Loading...</>
  return <div>
    <p>{result.data[0]}</p>
    <p>${result.data[1]}</p>
  </div>
}
