import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-16">
      <div className="w-full max-w-sm mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-8">
          Kintime
        </p>
        <h1 className="text-3xl font-bold mb-8">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  )
}
