// ===========================================
// FILE: src/app/page.tsx
// PURPOSE: Homepage - will redirect to dashboard or login
// ===========================================

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          ⚡ TrueLevel
        </h1>
        <p className="text-text-secondary">
          Chemical Inventory Management for Car Washes
        </p>
        <p className="text-sm text-text-tertiary mt-4">
          Phase 1: Foundation - In Progress
        </p>
      </div>
    </main>
  );
}
