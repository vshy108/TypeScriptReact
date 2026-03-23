import { useState } from 'react'

export default function Profile({ showBio }: { readonly showBio: boolean }) {
  if (showBio) {
    const [bio] = useState('Ready to ship')
    return <p>{bio}</p>
  }

  return <div>Profile</div>
}
