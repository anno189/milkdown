/* Copyright 2021, Milkdown by Mirone. */
import { InputRule } from '@milkdown/prose/inputrules'
import { Selection } from '@milkdown/prose/state'
import { $command, $inputRule, $nodeAttr, $nodeSchema } from '@milkdown/utils'
import { paragraphSchema } from './paragraph'

export const hrAttr = $nodeAttr('hr')
export const hrSchema = $nodeSchema('hr', ctx => ({
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  toDOM: node => ['hr', ctx.get(hrAttr.key)(node)],
  parseMarkdown: {
    match: ({ type }) => type === 'thematicBreak',
    runner: (state, _, type) => {
      state.addNode(type)
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'hr',
    runner: (state) => {
      state.addNode('thematicBreak')
    },
  },
}))

export const insertHrInputRule = $inputRule(() => new InputRule(
  /^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
    const { tr } = state

    if (match[0])
      tr.replaceWith(start - 1, end, hrSchema.type().create())

    return tr
  },
))

export const insertHrCommand = $command('InsertHr', () => () => (state, dispatch) => {
  if (!dispatch)
    return true

  const paragraph = paragraphSchema.node.type().create()
  const { tr, selection } = state
  const { from } = selection
  const node = hrSchema.type().create()
  if (!node)
    return true

  const _tr = tr.replaceSelectionWith(node).insert(from, paragraph)
  const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true)
  if (!sel)
    return true

  dispatch(_tr.setSelection(sel).scrollIntoView())
  return true
})

