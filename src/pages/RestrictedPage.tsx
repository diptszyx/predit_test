export default function RestrictedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex">
          <img src="/logo-MarkWhite.svg" alt="Logo" className="h-16 w-16" />
          <h1 className="ml-2 mt-2 text-4xl font-bold">Predit Market</h1>
        </div>

        <h1 className="text-2xl font-bold">Access Restricted</h1>
        <p className="text-lg text-muted-foreground">
          Access from your country is currently restricted in accordance with
          our{' '}
          <a href="/terms-of-service" className="text-primary hover:underline">
            Terms of Use
          </a>
          . We appreciate your understanding.
        </p>
      </div>
    </div>
  );
}
