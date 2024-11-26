'use client'

import { useFrameContext } from "../hooks/useFrameContext";

export default function FrameContextPage() {
  const frameContext = useFrameContext()

  return <h1>Hi {frameContext.user?.username}</h1>
}
