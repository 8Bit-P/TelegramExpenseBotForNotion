import { useState } from "react";
import { supabase } from "../lib/supabase";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          emailProps={{
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
          passwordProps={{
            value: password,
            onChange: (e) => setPassword(e.target.value),
          }}
          loading={loading}
          error={error}
          onFormSubmit={handleSubmit} // <-- use a custom prop, not `onSubmit`
        />
      </div>
    </div>
  );
}
