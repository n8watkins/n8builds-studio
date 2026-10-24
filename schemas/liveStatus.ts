import { useCallback } from 'react'
import { PatchEvent, defineField, defineType, set, type FormPatch, type ObjectInputProps } from 'sanity'

/**
 * The "Live status" switch for n8builds.dev (one document, id "liveStatus").
 *
 * Flip "Live now" on and publish when you go live, especially on X, which the
 * site can't detect by itself; it also overrides the automatic Twitch and
 * YouTube checks if they miss a stream. The site shows the corner player,
 * the navbar dot and the n8builds.dev/live redirect while it's on, and treats
 * it as off 12 hours after "Started at", in case you forget to switch it off.
 */

export const LIVE_STATUS_ID = 'liveStatus'

/** Stamps "Started at" whenever "Live now" is switched on. */
function LiveStatusInput(props: ObjectInputProps) {
  const { onChange } = props
  const handleChange = useCallback(
    (input: FormPatch | FormPatch[] | PatchEvent) => {
      const { patches } = PatchEvent.from(input)
      const switchedOn = patches.some((p) => p.type === 'set' && p.path.length === 1 && p.path[0] === 'live' && p.value === true)
      onChange(switchedOn ? [...patches, set(new Date().toISOString(), ['startedAt'])] : patches)
    },
    [onChange],
  )
  return props.renderDefault({ ...props, onChange: handleChange })
}

const PLATFORMS = [
  { title: 'X', value: 'x' },
  { title: 'Twitch', value: 'twitch' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Other', value: 'other' },
]

export const liveStatus = defineType({
  name: 'liveStatus',
  title: 'Live status',
  type: 'document',
  components: { input: LiveStatusInput },
  fields: [
    defineField({
      name: 'live',
      title: 'Live now',
      type: 'boolean',
      description: 'Switch on and publish when you go live; switch off and publish when you stop. It also turns itself off 12 hours after it was switched on.',
      initialValue: false,
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: PLATFORMS, layout: 'radio', direction: 'horizontal' },
      initialValue: 'x',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link to the stream',
      type: 'url',
      description: 'The live post or stream page. Optional for X and Twitch (the channel is used); needed for YouTube and Other.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['https'] }).custom((url, context) => {
          const doc = context.document as { live?: boolean; platform?: string } | undefined
          if (!url && doc?.live && (doc.platform === 'youtube' || doc.platform === 'other')) return 'Add the link to the stream for this platform.'
          return true
        }),
    }),
    defineField({
      name: 'title',
      title: 'Stream title',
      type: 'string',
      description: 'Optional. Shown in the player on the site.',
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'startedAt',
      title: 'Started at',
      type: 'datetime',
      description: 'Set automatically when "Live now" is switched on.',
      readOnly: true,
    }),
  ],
  preview: {
    select: { live: 'live', platform: 'platform', title: 'title' },
    prepare({ live, platform, title }: { live?: boolean; platform?: string; title?: string }) {
      const name = PLATFORMS.find((p) => p.value === platform)?.title ?? 'a stream'
      return { title: live ? `Live on ${name}` : 'Offline', subtitle: live ? title : 'Switch on when you go live' }
    },
  },
})
