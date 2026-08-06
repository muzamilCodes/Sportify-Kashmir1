export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300">
      {children}
    </div>
  );
}
