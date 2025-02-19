/* Copyright 2021, Milkdown by Mirone. */
import type { Slice } from '@milkdown/core'
import type { PluginSpec } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'

export type SlashPluginSpecId<Id extends string> = `${Id}_SLASH_SPEC`

export type SlashPlugin<Id extends string, State = any> = [$Ctx<PluginSpec<State>, SlashPluginSpecId<Id>>, $Prose] & {
  key: Slice<PluginSpec<State>, SlashPluginSpecId<Id>>
  pluginKey: $Prose['key']
}

export const slashFactory = <Id extends string, State = any>(id: Id) => {
  const slashSpec = $ctx<PluginSpec<State>, SlashPluginSpecId<Id>>({}, `${id}_SLASH_SPEC`)
  const slashPlugin = $prose((ctx) => {
    const spec = ctx.get(slashSpec.key)
    return new Plugin({
      key: new PluginKey(`${id}_SLASH`),
      ...spec,
    })
  })
  const result = [slashSpec, slashPlugin] as SlashPlugin<Id>
  result.key = slashSpec.key
  result.pluginKey = slashPlugin.key

  return result
}

export const slash = slashFactory('MILKDOWN')
