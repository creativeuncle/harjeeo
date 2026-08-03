export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-(--color-canvas) px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-lg font-semibold">Harjeeo</div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-(--color-text-muted)">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
