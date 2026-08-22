"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Hospital } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-content shadow-lg">
            <Hospital className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-center">
            Hospital Management
          </h1>

          <p className="text-base-content/60 text-center">
            Système de gestion hospitalière
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            <h2 className="text-xl font-semibold">
              Connexion
            </h2>

            <p className="text-sm text-base-content/60">
              Connectez-vous à votre espace
            </p>

            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="label">
                  <span className="label-text">
                    Adresse email
                  </span>
                </label>

                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="admin@hospital.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">
                    Mot de passe
                  </span>
                </label>

                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

          </div>
        </div>

        <p className="text-center text-xs text-base-content/40 mt-6">
          © {new Date().getFullYear()} Hospital Management
        </p>

      </div>
    </main>
  );
}