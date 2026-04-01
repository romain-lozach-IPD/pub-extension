import { createCrudStore } from '../lib/crudStore.js'

const base = createCrudStore('environments')

let currentEnvs = []
base.subscribe(envs => { currentEnvs = envs })

export const environments = {
  ...base,

  setActive: (id) => {
    base._mutate(envs =>
      envs.map(env => ({ ...env, isActive: env.id === id }))
    )
  },

  getActive: () => currentEnvs.find(env => env.isActive) || currentEnvs[0] || null
}
