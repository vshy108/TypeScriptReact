import { useState } from 'react'

export default function Profile({ showBio }: { readonly showBio: boolean }) {
  const [bio] = useState('Ready to ship')

  return <div>{showBio ? bio : 'Profile'}</div>
}
