import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/portal')({
  component: PortalPage,
});

function PortalPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-background p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Client Portal</h1>
        <p className="text-muted-foreground mt-2">Manage your profile, API limits, and subscriptions.</p>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Usage Statistics</h2>
            <div className="h-40 flex items-center justify-center border border-dashed border-glass-border rounded-xl">
              Chart Placeholder
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Subscription Plan</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-muted-foreground">Current Plan</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">Premium</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
