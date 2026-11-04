import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './schemas'
import { LIVE_STATUS_ID } from './schemas/liveStatus'
import { PreviewAction } from './actions/previewAction'

// "Live status" is a single document: one tap from the Studio home, never
// created twice, duplicated or deleted.
const SINGLETONS = new Set(['liveStatus'])
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'N8 Notions Studio',

  projectId: 'abgyc32w',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Live status')
              .id(LIVE_STATUS_ID)
              .schemaType('liveStatus')
              .child(S.document().schemaType('liveStatus').documentId(LIVE_STATUS_ID).title('Live status')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => !SINGLETONS.has(item.getId() ?? '')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },

  document: {
    actions: (actions, { schemaType }) => {
      if (SINGLETONS.has(schemaType)) return actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
      // Posts get "Preview" right after Publish (see actions/previewAction.ts).
      if (schemaType === 'post') return [actions[0], PreviewAction, ...actions.slice(1)]
      return actions
    },
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'global' ? options.filter((o) => !SINGLETONS.has(o.templateId)) : options,
  },
})
