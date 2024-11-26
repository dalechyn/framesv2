'use client'

import { FrameContext } from '@farcaster/frame-core'
import { create } from 'zustand'


export const useFrameContext = create<(FrameContext | { user: null; }) & {
  set: (context: FrameContext) => void
}>(
  (set) => ({
    user: null,
    set: (context) => set(context),
  })
)
