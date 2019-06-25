//TODO: switch production url to one that actually exists
const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8085"
    : "https://server.hr-robocon.org";

export function getAllThreads() {
  return fetch(`${baseUrl}/api/forum/thread/`)
    .then(res => res.json())
    .then(threads =>
      threads.map(thread => {
        thread.created = new Date(thread.created);
        return thread;
      })
    );
}
