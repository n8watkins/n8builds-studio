import { defineField, defineType } from 'sanity'

/**
 * A hand-written highlight for the build log at n8builds.dev/builds.
 *
 * The log fills itself from GitHub; post one of these only for a moment worth
 * a sentence ("Scribe now transcribes while you're still talking"). It is
 * pinned above the automatic entries of its month, and shows on the build's
 * page under "Recent activity".
 */

// The builds the log tracks (data/builds.tsx in n8builds-web, the ones with a repo).
const BUILDS = [
  { title: 'Scribe', value: 'scribe' },
  { title: 'Solara', value: 'solara' },
  { title: 'Portfolio Rank', value: 'portfolio-rank' },
  { title: 'TL;DW', value: 'tldw' },
  { title: 'TubeVault', value: 'tubevault' },
  { title: 'Piper TTS', value: 'piper-tts' },
]

export const logEntry = defineType({
  name: 'logEntry',
  title: 'Build log highlight',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'build',
      title: 'Build',
      type: 'string',
      options: { list: BUILDS, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Shipped', value: 'shipped' },
          { title: 'Fixed', value: 'fixed' },
          { title: 'Learned', value: 'learned' },
          { title: 'Next', value: 'next' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'shipped',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      description: 'One line, like a headline. At most 90 characters.',
      type: 'string',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      description: 'Optional: a sentence or two of context.',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'link', title: 'Link', description: 'Optional: a release, a demo, a post.', type: 'url' }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (rule) => rule.required() })],
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', build: 'build', date: 'date', media: 'image' },
    prepare: ({ title, build, date, media }) => ({
      title,
      subtitle: [BUILDS.find((b) => b.value === build)?.title ?? build, date].filter(Boolean).join(' · '),
      media,
    }),
  },
})
