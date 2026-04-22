<script lang="ts">
  import { currentPage } from './stores/navigation.ts'
  import Layout from './components/Layout.svelte'
  import Home from './components/Home.svelte'
  import Tools from './components/Tools.svelte'
  import LinksManager from './components/LinksManager.svelte'
  import TasksManager from './components/TasksManager.svelte'
  import ApiDoc from './components/ApiDoc.svelte'
  import Settings from './components/Settings.svelte'
</script>

<Layout>
  {#if $currentPage === 'home'}
    <Home />
  {:else if $currentPage === 'tools'}
    <Tools />
  {:else if $currentPage === 'links'}
    <LinksManager />
  {:else if $currentPage === 'tasks'}
    <TasksManager />
  {:else if $currentPage === 'apidoc'}
    <ApiDoc />
  {:else if $currentPage === 'settings'}
    <Settings />
  {/if}
</Layout>
