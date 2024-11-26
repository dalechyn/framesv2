import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { frameConnector } from './connector'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()]
})
