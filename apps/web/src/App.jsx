const highlights = [
  {
    title: "Product-first monorepo",
    body: "The repo is organized around the Travel Experience Platform instead of generic backend/frontend labels.",
  },
  {
    title: ".NET API ready",
    body: "The API folder contains a minimal ASP.NET Core service with health and info endpoints.",
  },
  {
    title: "React web starter",
    body: "The web app uses Vite and React so you can iterate quickly on the travel experience UI.",
  },
];

function App() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Travel Experience Platform</p>
        <h1>One product, cleanly split across apps and services.</h1>
        <p className="lede">
          This template gives you a default starting point for the .NET API, the
          React frontend, and future Node.js services without locking the repo
          into a brittle backend/frontend naming scheme.
        </p>
        <div className="actions">
          <a href="/" className="button button-primary">
            View API root
          </a>
          <a href="/" className="button button-secondary">
            Explore template
          </a>
        </div>
      </section>

      <section className="grid">
        {highlights.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
