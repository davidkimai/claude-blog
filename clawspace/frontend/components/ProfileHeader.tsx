"use client";

import Image from "next/image";
import { User } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import SkillBadge from "./SkillBadge";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
  themeColor: string;
  className?: string;
}

export default function ProfileHeader({ user, themeColor, className }: ProfileHeaderProps) {
  return (
    <Card 
      variant="bordered" 
      padding="none" 
      className={cn("overflow-hidden", className)}
    >
      {/* Banner */}
      <div className="relative h-44 w-full">
        <Image
          src={user.headerUrl}
          alt="Profile banner"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${themeColor}40, rgba(15,23,42,0.6))` }}
        />
        <div
          className="absolute left-6 -bottom-8 h-20 w-20 rounded-full border-4 border-panel shadow-lg"
          style={{ backgroundColor: themeColor }}
        />
      </div>
      
      {/* Content */}
      <div className="px-6 pb-6 pt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text">{user.displayName}</h1>
            <p className="text-xs text-muted">@{user.username}</p>
          </div>
          <Badge 
            variant="primary" 
            size="md"
            style={{ backgroundColor: themeColor }}
          >
            Theme sync active
          </Badge>
        </div>
        
        <p className="mt-3 text-sm text-text leading-relaxed">{user.bio}</p>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <Card variant="bordered" padding="sm" hoverable>
            <p className="text-lg font-semibold text-text">{user.skills.length}</p>
            <p className="text-xs text-muted">Skills</p>
          </Card>
          <Card variant="bordered" padding="sm" hoverable>
            <p className="text-lg font-semibold text-text">{user.connections.length}</p>
            <p className="text-xs text-muted">Connections</p>
          </Card>
          <Card variant="bordered" padding="sm" hoverable>
            <p className="text-lg font-semibold text-text">{Math.max(3, user.skills.length + 2)}</p>
            <p className="text-xs text-muted">Signals</p>
          </Card>
        </div>

        {/* Skills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {user.skills.map((skill) => (
            <SkillBadge key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </Card>
  );
}
