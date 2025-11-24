export default function TermsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10 text-sm md:px-8">
      <h1 className="text-2xl font-semibold">Terms of Use</h1>
      <p>
        Funnies is provided “as is” without warranties. By using the app you
        acknowledge blockchain interactions are irreversible and subject to
        network fees.
      </p>
      <p>
        You are responsible for safeguarding your wallet keys, verifying
        transactions before signing, and complying with applicable laws in your
        jurisdiction.
      </p>
      <p>
        For questions, reach out at support@funnies-app.vercel.app.
      </p>
    </main>
  );
}
