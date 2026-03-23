import { createPost } from '../../actions/posts.js'
import { LikeButton } from '../../components/LikeButton.js'

interface Post {
  readonly id: string
  readonly title: string
}

const posts: readonly Post[] = [
  { id: 'post-1', title: 'Server boundaries' },
  { id: 'post-2', title: 'Client islands' },
]

export default async function PostsPage() {
  return (
    <main>
      <h1>Posts</h1>
      <form action={createPost}>
        <input name="title" defaultValue="Boundary audit" />
        <textarea name="content" defaultValue="Verify the RSC split." />
      </form>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <LikeButton postId={post.id} />
        </article>
      ))}
    </main>
  )
}
