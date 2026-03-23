export default function SettingsPage() {
  async function updateTheme(formData: FormData) {
    'use server'

    const theme = String(formData.get('theme') ?? 'light')

    void theme
  }

  return (
    <form action={updateTheme}>
      <select name="theme" defaultValue="light">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <button type="submit">Save theme</button>
    </form>
  )
}
