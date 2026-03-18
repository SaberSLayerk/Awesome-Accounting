import {client, urlFor} from './sanity.js'

const params = new URLSearchParams(window.location.search)
const slug = params.get('slug')
const container = document.getElementById('post-page')

const query = `
*[
  _type == "post" &&
  slug.current == $slug &&
  defined(publishedAt)
][0]{
  title,
  publishedAt,
  _createdAt,
  author,
  coverImage,
  body
}
`

if (!slug) {
  container.innerHTML = '<p>Missing post slug.</p>'
} else {
  loadPost()
}

async function loadPost() {
  try {
    console.log('Loading slug:', slug)

    const post = await client.fetch(query, {slug})
    console.log('Post returned:', post)

    if (!post) {
      container.innerHTML = '<p>Post not found.</p>'
      return
    }

    const dateValue = post.publishedAt || post._createdAt || ''
    const date = dateValue ? new Date(dateValue).toLocaleDateString() : ''

    const image = post.coverImage
      ? `<img src="${urlFor(post.coverImage).width(1200).url()}" alt="${escapeHtml(post.title || 'Post image')}" class="post-image">`
      : ''

    const body = renderPortableText(post.body)

    container.innerHTML = `
      <article class="post">

        <header class="post-header">
          <h1 class="post-title">
            ${escapeHtml(post.title || 'Untitled')}
          </h1>

          <div class="post-meta">
            ${date}${post.author ? ` • ${escapeHtml(post.author)}` : ''}
          </div>
        </header>

        <div class="post-image">
          ${image}
        </div>

        <div class="post-content">
          ${body}
        </div>
        
      </article>
    `
  } catch (error) {
    console.error('Error loading post:', error)
    container.innerHTML = `
      <p>Could not load post.</p>
      <pre>${escapeHtml(String(error))}</pre>
    `
  }
}

function renderPortableText(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return '<p>No content.</p>'
  }

  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) {
      return ''
    }

    const text = block.children.map((child) => escapeHtml(child.text || '')).join('')

    switch (block.style) {
      case 'h1':
        return `<h1>${text}</h1>`
      case 'h2':
        return `<h2>${text}</h2>`
      case 'h3':
        return `<h3>${text}</h3>`
      case 'blockquote':
        return `<blockquote>${text}</blockquote>`
      default:
        return `<p>${text}</p>`
    }
  }).join('')
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}