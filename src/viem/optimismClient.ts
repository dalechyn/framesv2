import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";

export const optimismClient = createPublicClient({
  chain: optimism,
  transport: http()
})
