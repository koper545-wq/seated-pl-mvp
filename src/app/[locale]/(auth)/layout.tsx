export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-muted/30">
      {children}
    </div>
  );
}
