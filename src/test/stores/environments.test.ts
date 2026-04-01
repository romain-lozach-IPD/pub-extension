import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { environments } from '../../stores/environments.ts'
import type { Environment } from '../../types.ts'

function makeEnv(id: string, isActive = false): Environment {
  return { id, name: `Env ${id}`, url_api: 'http://api', url_front: 'http://front', login: 'user', password: 'pass', isActive }
}

beforeEach(() => {
  environments._setStore([])
})

describe('environments.setActive', () => {
  it('marque l\'env ciblé comme actif', () => {
    environments._setStore([makeEnv('1'), makeEnv('2')])
    environments.setActive('2')
    expect(get(environments).find(e => e.id === '2')?.isActive).toBe(true)
  })

  it('désactive tous les autres envs', () => {
    environments._setStore([makeEnv('1', true), makeEnv('2'), makeEnv('3')])
    environments.setActive('3')
    const active = get(environments).filter(e => e.isActive)
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('3')
  })
})

describe('environments.getActive', () => {
  it('retourne l\'env avec isActive = true', () => {
    environments._setStore([makeEnv('1'), makeEnv('2', true)])
    expect(environments.getActive()?.id).toBe('2')
  })

  it('retourne null si le store est vide', () => {
    expect(environments.getActive()).toBeNull()
  })
})
