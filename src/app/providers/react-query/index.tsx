/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query'
import * as React from 'react'

/* eslint-disable-next-line @typescript-eslint/no-wrapper-object-types */
function isPlainObject(o: any): o is Object {
  if (!hasObjectPrototype(o)) {
    return false
  }

  // If has modified constructor
  const ctor = o.constructor
  if (typeof ctor === 'undefined') return true

  // If has modified prototype
  const prot = ctor.prototype
  if (!hasObjectPrototype(prot)) return false

  // If constructor does not have an Object-specific method
  // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
  if (!prot.hasOwnProperty('isPrototypeOf')) return false

  // Most likely a plain Object
  return true
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]'
}


function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: function hashFn(queryKey: QueryKey): string {
          return JSON.stringify(queryKey, (_, value) => {
            if (isPlainObject(value))
            return Object.keys(value)
              .sort()
              .reduce((result, key) => {
                result[key] = value[key]
                return result
              }, {} as any)
            if (typeof value === 'bigint') return value.toString()
            return value
          })
        }
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one
  // This is very important so we don't re-make a new client if React
  // supsends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function ReactQueryProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
