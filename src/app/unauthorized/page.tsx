export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h1 className="text-3xl font-bold">
            Accès refusé
          </h1>

          <p className="text-base-content/70">
            Vous n'avez pas les permissions nécessaires
            pour accéder à cette page.
          </p>

          <a
            href="/dashboard"
            className="btn btn-primary mt-4"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  );
}