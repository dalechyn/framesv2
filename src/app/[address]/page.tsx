import { getAddress } from "viem";
import SwapPage_ from './_page'

export default async function SwapPage(props: {params: Promise<{address: string}>}) {
  const poolAddress = getAddress((await props.params).address)

  return <SwapPage_ address={poolAddress}/>
}
