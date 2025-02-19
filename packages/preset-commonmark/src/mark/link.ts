/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { toggleMark } from '@milkdown/prose/commands'
import type { Node as ProseNode } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $command, $markAttr, $markSchema } from '@milkdown/utils'

export const linkAttr = $markAttr('link')
export const linkSchema = $markSchema('link', ctx => ({
  inclusive: false,
  attrs: {
    href: {},
    title: { default: null },
  },
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return { href: dom.getAttribute('href'), title: dom.getAttribute('title') }
      },
    },
  ],
  toDOM: mark => ['a', { ...ctx.get(linkAttr.key)(mark), ...mark.attrs }],
  parseMarkdown: {
    match: node => node.type === 'link',
    runner: (state, node, markType) => {
      const url = node.url as string
      const title = node.title as string
      state.openMark(markType, { href: url, title })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'link',
    runner: (state, mark) => {
      state.withMark(mark, 'link', undefined, {
        title: mark.attrs.title,
        url: mark.attrs.href,
      })
    },
  },
}))

export type UpdateLinkCommandPayload = {
  href?: string
  title?: string
}
export const toggleLinkCommand = $command('ToggleLink', () => (payload: UpdateLinkCommandPayload = {}) => toggleMark(linkSchema.type(), payload))
export const updateLinkCommand = $command('UpdateLink', () => (payload: UpdateLinkCommandPayload = {}) => (state, dispatch) => {
  if (!dispatch)
    return false

  let node: ProseNode | undefined
  let pos = -1
  const { selection } = state
  const { from, to } = selection
  state.doc.nodesBetween(from, from === to ? to + 1 : to, (n, p) => {
    if (linkSchema.type().isInSet(n.marks)) {
      node = n
      pos = p
      return false
    }

    return undefined
  })

  if (!node)
    return false

  const mark = node.marks.find(({ type }) => type === linkSchema.type())
  if (!mark)
    return false

  const start = pos
  const end = pos + node.nodeSize
  const { tr } = state
  const linkMark = linkSchema.type().create({ ...mark.attrs, ...payload })
  if (!linkMark)
    return false

  dispatch(
    tr
      .removeMark(start, end, mark)
      .addMark(start, end, linkMark)
      .setSelection(new TextSelection(tr.selection.$anchor))
      .scrollIntoView(),
  )

  return true
})
