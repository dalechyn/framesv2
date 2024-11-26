'use client'

import sdk from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useFrameContext } from "../hooks/useFrameContext";

export default function FrameSdkLoader() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const frameContext = useFrameContext()

  useEffect(() => {
    const load = async () => {
      frameContext.set(await sdk.context)
      await sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return null
}
