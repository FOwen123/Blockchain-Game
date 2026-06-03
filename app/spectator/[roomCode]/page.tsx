import { SpectatorRoom } from "@/components/SpectatorRoom";

type PageProps = {
  params: Promise<{ roomCode: string }>;
};

export default async function Page({ params }: PageProps) {
  const { roomCode } = await params;
  return <SpectatorRoom roomCode={roomCode} />;
}
