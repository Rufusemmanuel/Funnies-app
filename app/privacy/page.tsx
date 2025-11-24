import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10 text-sm md:px-8">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p>
        Funnies only uses your Farcaster session to render the mini app UI and
        your wallet address to submit mint transactions you explicitly
        initiate. No personal information is sold or shared with third parties.
      </p>
      <p>
        On-chain actions (mints) are public on Base. Off-chain logs are kept
        briefly for error monitoring and are deleted on a rolling basis.
      </p>
      <p>
        Contact <Link href="mailto:support@funnies-app.vercel.app">support@funnies-app.vercel.app</Link>{" "}
        if you need data removed from our analytics or have privacy questions.
      </p>
    </main>
  );
}
