import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="flex h-screen w-full flex-col bg-background p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Centralized control panel for platform management.</p>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-foreground">System Overview</h2>
            <div className="h-64 flex items-center justify-center border border-dashed border-glass-border rounded-xl">
              System Metrics Chart
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Users</h2>
            <ul className="space-y-3">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-medium">
                    U{i}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">User {i}</div>
                    <div className="text-xs text-muted-foreground">user{i}@example.com</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
