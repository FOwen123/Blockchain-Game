import { HostRoom } from "@/components/HostRoom";

type PageProps = {
  params: Promise<{ roomCode: string }>;
};

export default async function Page({ params }: PageProps) {
  const { roomCode } = await params;
  return <HostRoom roomCode={roomCode} />;
}
