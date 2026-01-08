import { ArrowLeft } from "lucide-react"

export interface PostCardProps {
  post: {
    id: string | number
    title: string
    excerpt?: string
    thumbnail?: string | null
    slug: string
    date?: string | null
  }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200">
      <div className="w-full md:w-1/3 h-48 md:h-auto">
        <img
          src={post.thumbnail || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        {post.date && <div className="text-sm text-gray-500 mb-2 rtl-dir">{post.date}</div>}
        <h2 className="secular text-2xl text-[var(--dark-green)] mb-3">{post.title}</h2>
        {post.excerpt && <p className="text-base mb-4">{post.excerpt}</p>}
        <div className="mt-auto">
          <a
            href={post.slug}
            className="flex justify-between items-center text-[#5c6d3f] hover:text-[var(--dark-green)] transition-colors duration-200"
          >
            <span className="secular font-bold">קרא עוד</span>
            <ArrowLeft className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}

