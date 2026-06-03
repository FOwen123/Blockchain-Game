"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
};

export function QrCode({ value }: Props) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let mounted = true;
    void QRCode.toDataURL(value, {
      color: {
        dark: "#c8f6ff",
        light: "#161724"
      },
      margin: 1,
      width: 220
    }).then((nextSrc) => {
      if (mounted) setSrc(nextSrc);
    });
    return () => {
      mounted = false;
    };
  }, [value]);

  if (!src) {
    return <div className="panel" style={{ aspectRatio: "1", width: 220 }} aria-label="QR code loading" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="QR code for classmates to join the race"
      height={220}
      src={src}
      style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
      width={220}
    />
  );
}
