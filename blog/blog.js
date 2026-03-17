import {client, urlFor} from './sanity.js'

const container = document.getElementById('blog-list')

const query = `
*[
  _type == "post" &&
  defined(slug.current) &&
  defined(publishedAt)
]
| order(publishedAt desc) {
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  author,
  coverImage
}
`

async function loadPosts() {
  try {
    const posts = await client.fetch(query)

    if (!posts || posts.length === 0) {
      container.innerHTML = '<p>No blog posts found.</p>'
      return
    }

    container.innerHTML = posts.map((post) => {

      const postUrl = `/blog/single-post.html?slug=${encodeURIComponent(post.slug)}`

      const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString()
        : ''

      const image = post.coverImage
        ? `<img src="${urlFor(post.coverImage).width(800).url()}" alt="${escapeHtml(post.title)}">`
        : ''

      return `
        <article>

          <a href="${postUrl}">
            ${image}
          </a>

          <h2>
            <a href="${postUrl}">
              ${escapeHtml(post.title)}
            </a>
          </h2>

          <div>${date}${post.author ? ` • ${escapeHtml(post.author)}` : ''}</div>

          <p>${escapeHtml(post.excerpt || '')}</p>

          <a href="${postUrl}">Read More</a>

        </article>
      `
    }).join('')
  } catch (error) {
    console.error('Error loading posts:', error)
    container.innerHTML = '<p>Could not load blog posts.</p>'
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

loadPosts()