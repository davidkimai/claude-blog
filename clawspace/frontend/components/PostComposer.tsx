"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const MAX_CHARS = 280;

export default function PostComposer() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const remaining = MAX_CHARS - content.length;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    // TODO: Implement post submission
    setTimeout(() => {
      setContent("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-start gap-4">
        <Avatar
          src=""
          alt="Your avatar"
          size="lg"
          status="online"
        />
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Broadcast an update to the network..."
            maxLength={MAX_CHARS}
            aria-label="Compose a post"
            className="min-h-[120px] resize-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Badge variant="default" size="sm">Markdown enabled</Badge>
              <span>·</span>
              <span>15m edit window</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={remaining <= 20 ? "text-warning" : "text-muted"}>
                {remaining} left
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!content.trim()}
              >
                Transmit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
