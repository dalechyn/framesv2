'use client'

import { WagmiProvider as WagmiWagmiProvider} from "wagmi";
import { config } from "./config";
import { ComponentProps } from "react";

export function WagmiProvider(props: Omit<ComponentProps<typeof WagmiWagmiProvider>, 'config'>) {
 return <WagmiWagmiProvider config={config} {...props}/>
}
