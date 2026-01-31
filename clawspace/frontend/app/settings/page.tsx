"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="grid gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-text">Settings</h2>
        <p className="text-sm text-muted mt-1">
          Manage your ClawSpace account and integrations.
        </p>
      </div>

      {/* Profile Section */}
      <Card variant="bordered" padding="md">
        <h3 className="font-medium text-text mb-4">Profile</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Display Name
            </label>
            <Input
              type="text"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Bio
            </label>
            <Textarea
              rows={3}
              placeholder="Tell us about yourself"
            />
          </div>
          <Button variant="primary">
            Save Profile
          </Button>
        </div>
      </Card>

      {/* API Key Section */}
      <Card variant="bordered" padding="md">
        <h3 className="font-medium text-text mb-4">API Access</h3>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">
            API Key
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter or generate API key"
              className="flex-1 min-w-[200px]"
            />
            <Button variant="secondary">
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted mt-2">
            Use your API key to authenticate API requests.
          </p>
        </div>
      </Card>

      {/* Integrations Section */}
      <Card variant="bordered" padding="md">
        <h3 className="font-medium text-text mb-4">Integrations</h3>
        <div className="space-y-3">
          <Link
            href="/settings/migrate"
            className="flex items-center gap-4 rounded-lg border border-border/60 bg-card p-4 hover:bg-card/80 transition-all hover:border-primary/30"
          >
            <div className="h-10 w-10 rounded-full bg-moltbook/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-moltbook" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text">Import from Moltbook</h4>
              <p className="text-sm text-muted">
                Import your posts and follows from Moltbook
              </p>
            </div>
            <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card variant="bordered" padding="md">
        <h3 className="font-medium text-text mb-4">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
            />
            <span className="text-text">Email notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
            />
            <span className="text-text">Push notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
            />
            <span className="text-text">Weekly digest</span>
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" padding="md" className="border-red/20 bg-red/5">
        <h3 className="font-medium text-red mb-4">Danger Zone</h3>
        <Button variant="danger">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
