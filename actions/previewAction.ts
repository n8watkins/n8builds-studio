import { EyeOpenIcon } from '@sanity/icons/EyeOpen'
import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret'
import { useState } from 'react'
import { useClient, useCurrentUser, type DocumentActionComponent } from 'sanity'

/**
 * "Preview": opens the post as it is now, draft included, at its real URL on
 * n8builds.dev.
 *
 * The Studio writes a one-hour secret into the dataset (as a draft, so only
 * signed-in project members and the site's read token can see it), and the
 * site's /api/draft-mode/enable checks it before switching on draft mode for
 * that browser. Nobody without a Studio login can make a working link.
 */

// The site to preview on. `SANITY_STUDIO_PREVIEW_URL=http://localhost:3737 npm run dev`
// previews on a local n8builds-web instead.
const SITE_URL = (process.env.SANITY_STUDIO_PREVIEW_URL || 'https://n8builds.dev').replace(/\/$/, '')

type Slugged = { slug?: { current?: string } }

export const PreviewAction: DocumentActionComponent = ({ draft, published, onComplete }) => {
  const client = useClient({ apiVersion: '2025-02-19' })
  const user = useCurrentUser()
  const [opening, setOpening] = useState(false)
  const slug = ((draft || published) as Slugged | null)?.slug?.current

  return {
    label: opening ? 'Opening preview…' : 'Preview',
    icon: EyeOpenIcon,
    disabled: !slug || opening,
    title: slug ? 'Open this post, draft included, on n8builds.dev' : 'Add a slug to preview this post',
    onHandle: async () => {
      if (!slug) return
      // Opened before the await, so the browser counts it as part of the click
      // and doesn't block it as a popup.
      const tab = window.open('about:blank', '_blank')
      setOpening(true)
      try {
        const { secret } = await createPreviewSecret(client, 'n8builds-studio', window.location.origin, user?.id)
        const url = new URL('/api/draft-mode/enable', SITE_URL)
        url.searchParams.set('sanity-preview-secret', secret)
        url.searchParams.set('sanity-preview-pathname', `/blog/${slug}`)
        if (tab) {
          tab.opener = null
          tab.location.href = url.toString()
        } else {
          window.open(url.toString(), '_blank', 'noopener')
        }
      } catch (error) {
        tab?.close()
        console.error('Could not open the preview', error)
        window.alert('Could not open the preview. Check your connection and try again.')
      } finally {
        setOpening(false)
        onComplete()
      }
    },
  }
}
