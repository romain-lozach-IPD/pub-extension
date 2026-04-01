import { createCrudStore } from '../lib/crudStore.ts'
import type { Environment } from '../types.ts'

const base = createCrudStore<Environment>('environments')

let currentEnvs: Environment[] = []
base.subscribe(envs => { currentEnvs = envs })

export const environments = {
  ...base,

  setActive: (id: string): void => {
    base._mutate(envs =>
      envs.map(env => ({ ...env, isActive: env.id === id }))
    )
  },

  getActive: (): Environment | null =>
    currentEnvs.find(env => env.isActive) ?? currentEnvs[0] ?? null
}
