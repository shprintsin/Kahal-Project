import { TOCWidget } from './TOCWidget'

export function PostSideBar({ post }: { post: any }) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-24">
      <TOCWidget post={post} />
    </aside>
  )
}

