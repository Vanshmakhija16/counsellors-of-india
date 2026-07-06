import { redirect } from 'next/navigation'

// Settings has been merged into the "My Profile & Website" editor.
// Keep this route alive (bookmarks, old links) and just forward it on.
export default function SettingsRedirect() {
  redirect('/dashboard/profile')
}
