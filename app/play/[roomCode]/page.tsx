import { PlayerRoom } from "@/components/PlayerRoom";

type PageProps = {
  params: Promise<{ roomCode: string }>;
};

export default async function Page({ params }: PageProps) {
  const { roomCode } = await params;
  return <PlayerRoom roomCode={roomCode} />;
}
