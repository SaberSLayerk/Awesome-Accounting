import { createClient } from "https://esm.sh/@sanity/client"
import { createImageUrlBuilder } from "https://esm.sh/@sanity/image-url"

export const client = createClient({
  projectId: "jgxgnpy4",
  dataset: "production",
  apiVersion: "2026-03-06",
  useCdn: true
})

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}