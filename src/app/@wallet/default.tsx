'use client'

import { useAccount, useConfig, useConnect, useDisconnect } from "wagmi";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const config = useConfig()

  return <div>
    <p>{isConnected ? 'You are connected' : 'You are not connected'}</p>
    <p>{address}</p>
    <button
      onClick={() =>
        isConnected
          ? disconnect()
          : connect({ connector: config.connectors[0] })
      }
    >
      {isConnected ? "Disconnect" : "Connect"}
    </button>
  </div>
}
