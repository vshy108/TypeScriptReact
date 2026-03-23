import { useEffect } from 'react'

export default function UserProfile({ userId }: { readonly userId: string }) {
  useEffect(() => {
    console.info('Fetch user profile for', userId)
  }, [userId])

  return <div>{userId}</div>
}
