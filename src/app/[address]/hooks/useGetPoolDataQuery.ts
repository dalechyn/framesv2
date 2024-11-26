
import { useQuery } from "@tanstack/react-query";
import { Address, parseAbi } from "viem";

import { Ether, Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool, TickListDataProvider } from "@uniswap/v3-sdk";
import { base } from "viem/chains";
import { baseClient } from "@/viem/baseClient";
import { multicall } from "viem/actions";

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'

const SURROUNDING_TICKS = 50000

const abi = parseAbi([
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function fee() external view returns (uint24)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function tickSpacing() external view returns (int24)',
])

export function useGetPoolDataQuery(params: { address: Address }) {
  return useQuery(
    {
      queryKey: ['useGetPoolDataQuery', params] as const,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      queryFn: async ({ queryKey: [_, { address: poolAddress }] }) => {
        const result = await multicall(baseClient, {
          allowFailure: false,
          contracts: [{
            address: poolAddress,
            abi,
            functionName: 'slot0'
          }, {
            address: poolAddress,
            abi,
            functionName: 'fee'
          }, {
            address: poolAddress,
            abi,
            functionName: 'liquidity'
          },
          {
            address: poolAddress,
            abi,
            functionName: 'token0'
          },
          {
            address: poolAddress,
            abi,
            functionName: 'token1'
          },
          {
            address: poolAddress,
            abi,
            functionName: 'tickSpacing'
          }
          ]
        })


        const weth = Ether.onChain(base.id)
        const token = result[4] === WETH_ADDRESS ? new Token(base.id, result[3] as string, 18) : new Token(base.id, result[4] as string, 18)
        const pool = new Pool(
          weth.wrapped,
          token,
          result[1] as FeeAmount,
          result[0][0].toString(),
          result[2].toString(),
          result[0][1],
          new TickListDataProvider(await (async () => {
            const tick = result[0][1]
            const tickSpacing = result[5]
            const bitmapIndex = (tick: number, tickSpacing: number) => {
              return Math.floor(tick / tickSpacing / 256)
            }

            const minIndex = bitmapIndex(tick - 50000 * tickSpacing, tickSpacing)

            const maxIndex = bitmapIndex(tick + 50000 * tickSpacing, tickSpacing)

            const tickLensArgs = new Array(maxIndex - minIndex + 1)
              .fill(0)
              .map((_, i) => i + minIndex)
              .map((wordIndex) => [poolAddress, wordIndex] as const)

            const results = await multicall(baseClient, {
              allowFailure: false,
              contracts: tickLensArgs.map((args) => ({
                abi: [{ "inputs": [{ "internalType": "address", "name": "pool", "type": "address" }, { "internalType": "int16", "name": "tickBitmapIndex", "type": "int16" }], "name": "getPopulatedTicksInWord", "outputs": [{ "components": [{ "internalType": "int24", "name": "tick", "type": "int24" }, { "internalType": "int128", "name": "liquidityNet", "type": "int128" }, { "internalType": "uint128", "name": "liquidityGross", "type": "uint128" }], "internalType": "struct ITickLens.PopulatedTick[]", "name": "populatedTicks", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }] as const,
                address: '0x0CdeE061c75D43c82520eD998C23ac2991c9ac6d' as const,
                functionName: 'getPopulatedTicksInWord',
                args
              }))
            })
            console.log(results.flat().map(result => ({ index: result.tick, liquidityGross: result.liquidityGross.toString(), liquidityNet: result.liquidityNet.toString() })))
            return results.flat().map(result => ({ index: result.tick, liquidityGross: result.liquidityGross.toString(), liquidityNet: result.liquidityNet.toString() }))
          })(), result[5])
        )


        return { pool, token }
      }
    }
  )
}
