import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <DashboardShell
      title="Settings"
      description="Manage your account and notification preferences."
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Your email address is managed through your authentication
                provider.
              </p>
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={user?.id || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Your unique user identifier.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Notification and display preferences. Coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
