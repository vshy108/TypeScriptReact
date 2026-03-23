'use client'

import { useState } from 'react'

export function LikeButton({ postId }: { readonly postId: string }) {
  const [liked, setLiked] = useState(false)

  return (
    <button type="button" onClick={() => setLiked((current) => !current)}>
      {liked ? `Liked ${postId}` : `Like ${postId}`}
    </button>
  )
}
