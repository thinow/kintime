export default async function Page() {
  const res = await fetch(`${process.env.BACKEND_URL}/health`, {
    cache: "no-store",
  })
  const { time } = await res.json()

  return (
    <main>
      <h1>Kintime</h1>
      <p>Track time with the people you love.</p>
      <p>Server time: {time}</p>
    </main>
  )
}
