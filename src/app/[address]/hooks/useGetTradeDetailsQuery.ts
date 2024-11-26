import { useQuery } from "@tanstack/react-query";
import { Address, decodeAbiParameters, decodeFunctionData } from "viem";

import { CurrencyAmount, Ether, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { Pool, Route, SwapQuoter, SwapRouter, Trade } from "@uniswap/v3-sdk";
import { Hex } from "viem";
import { baseClient } from "@/viem/baseClient";
import { call } from "viem/actions";
import { base } from "viem/chains";

const QUOTER_CONTRACT_ADDRESS = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a'
const weth = Ether.onChain(base.id)

export function useGetTradeDetailsQuery(params: { pool: Pool, token: Token, amountIn: bigint, slippageTolerance: number, recipient: Address | undefined } | undefined) {
  return useQuery(
    {
      queryKey: ['useTradeDetailsQuery', params] as const,
      refetchInterval: 1000,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      queryFn: async ({ queryKey: [_, params] }) => {
        if (!params) throw new Error('Missing params!')

        const route = new Route([params.pool], weth, params.token)

        const { calldata } = SwapQuoter.quoteCallParameters(
          route,
          CurrencyAmount.fromRawAmount(
            weth,
            params.amountIn.toString()
          ),
          TradeType.EXACT_INPUT,
          {
            useQuoterV2: true,
          }
        )
        const { data: quoterCallDataReturn } = await call(baseClient, { to: QUOTER_CONTRACT_ADDRESS, data: calldata as Hex })
        if (!quoterCallDataReturn) throw new Error('Expected quoter to return data')

        // const [amountOut] = decodeAbiParameters([{ type: 'uint256' }], quoterCallDataReturn)

        const uncheckedTrade = await Trade.exactIn(route, CurrencyAmount.fromRawAmount(
          weth,
          params.amountIn.toString()
        ),
        )


        const options = {
          slippageTolerance: new Percent(params.slippageTolerance, 10_000),
          deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
          recipient: params.recipient ?? '0x0000000000000000000000000000000000000000',
        }
        const parameters = SwapRouter.swapCallParameters([uncheckedTrade], options)
        console.log(parameters)

        return { parameters: { calldata: `0x04e45aaf${parameters.calldata.slice(10)}`, value: parameters.value }, amountOut: BigInt(uncheckedTrade.outputAmount.quotient.toString()) }
      }
    }
  )
}
