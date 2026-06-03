"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { roomEventSchema, type RoomEvent } from "@/lib/game/types";

type ConnectionState = "connecting" | "online" | "local" | "offline";

type UseRaceRoomOptions = {
  roomCode: string;
  participantId: string;
  onEvent: (event: RoomEvent) => void;
};

type PresenceMeta = {
  participantId?: string;
};

export function useRaceRoom({ roomCode, participantId, onEvent }: UseRaceRoomOptions) {
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [presenceIds, setPresenceIds] = useState<string[]>([]);
  const onEventRef = useRef(onEvent);
  const senderRef = useRef<(event: RoomEvent) => Promise<void> | void>(() => undefined);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const channelName = `race:${roomCode}`;
    const cleanupCallbacks: Array<() => void> = [];
    let mounted = true;
    let supabaseReady = false;
    let localSender: ((event: RoomEvent) => void) | undefined;
    let supabaseSender: ((event: RoomEvent) => Promise<void>) | undefined;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const localChannel = new BroadcastChannel(channelName);
      localChannel.onmessage = (message: MessageEvent<RoomEvent>) => {
        const parsed = roomEventSchema.safeParse(message.data);
        if (parsed.success && parsed.data.originId !== participantId) {
          onEventRef.current(parsed.data);
        }
      };
      localSender = (event: RoomEvent) => {
        localChannel.postMessage(event);
      };
      queueMicrotask(() => {
        if (mounted && !supabaseReady) {
          setConnection("local");
        }
      });
      cleanupCallbacks.push(() => localChannel.close());
    }

    if (supabaseUrl && supabaseKey) {
      const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
      const channel: RealtimeChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: participantId }
        }
      });

      channel
        .on("broadcast", { event: "room-event" }, ({ payload }) => {
          const parsed = roomEventSchema.safeParse(payload);
          if (parsed.success) {
            onEventRef.current(parsed.data);
          }
        })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState() as Record<string, PresenceMeta[]>;
          const ids = Object.values(state)
            .flat()
            .map((presence) => presence.participantId)
            .filter((id): id is string => Boolean(id));
          setPresenceIds(Array.from(new Set(ids)));
        })
        .subscribe((status) => {
          if (!mounted) return;
          if (status === "SUBSCRIBED") {
            supabaseReady = true;
            setConnection("online");
            void channel.track({ participantId, onlineAt: Date.now() });
            return;
          }

          supabaseReady = false;
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnection(localSender ? "local" : "offline");
            return;
          }

          setConnection(localSender ? "local" : "connecting");
        });

      supabaseSender = async (event: RoomEvent) => {
        await channel.send({
          type: "broadcast",
          event: "room-event",
          payload: event
        });
      };

      cleanupCallbacks.push(() => {
        void channel.untrack();
        void supabase.removeChannel(channel);
      });
    }

    if (localSender || supabaseSender) {
      senderRef.current = async (event: RoomEvent) => {
        localSender?.(event);
        if (supabaseReady) {
          await supabaseSender?.(event);
        }
      };
    } else {
      queueMicrotask(() => setConnection("offline"));
      senderRef.current = () => undefined;
    }

    return () => {
      mounted = false;
      cleanupCallbacks.forEach((cleanup) => cleanup());
    };
  }, [participantId, roomCode]);

  const send = useCallback(async (event: RoomEvent) => {
    await senderRef.current(event);
  }, []);

  return { connection, presenceIds, send };
}
