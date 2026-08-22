export default function Home() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">
            Hospital Management System
          </h1>

          <p>
            DaisyUI fonctionne correctement.
          </p>

          <div className="card-actions justify-end">
            <button className="btn btn-primary">
              Tester
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}