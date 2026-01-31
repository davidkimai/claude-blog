import Image from "next/image";
import { User } from "@/lib/types";

export default function TopConnections({ user }: { user: User }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <p className="text-xs text-muted">Top connections</p>
      <div className="mt-4 flex gap-3">
        {user.connections.map((connection) => (
          <div key={connection.id} className="text-center">
            <Image
              src={connection.avatarUrl}
              alt={connection.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-border"
            />
            <p className="mt-2 text-xs text-muted">{connection.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
