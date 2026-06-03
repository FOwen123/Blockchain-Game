import { RadioTower, WifiOff } from "lucide-react";

type Props = {
  connection: "connecting" | "online" | "local" | "offline";
};

export function ConnectionBadge({ connection }: Props) {
  const isOnline = connection === "online" || connection === "local";
  const label =
    connection === "online"
      ? "Supabase live"
      : connection === "local"
        ? "Local tabs"
        : connection === "connecting"
          ? "Connecting"
          : "Offline";

  return (
    <span className={`chip ${isOnline ? "chip--cyan" : "chip--coral"}`}>
      {isOnline ? <RadioTower size={14} aria-hidden /> : <WifiOff size={14} aria-hidden />}
      {label}
    </span>
  );
}
