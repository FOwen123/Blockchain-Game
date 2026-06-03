"use client";

import { useEffect, useState } from "react";

export function useNow(enabled = true) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return now;
}
