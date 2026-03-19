<script>
  import { currentPage } from './stores/navigation.js'
  import Layout from './components/Layout.svelte'
  import Home from './components/Home.svelte'
  import XmlEditor from './components/XmlEditor.svelte'
  import LinksManager from './components/LinksManager.svelte'
  import TasksManager from './components/TasksManager.svelte'
  import Settings from './components/Settings.svelte'
</script>

<Layout>
  {#if $currentPage === 'home'}
    <Home />
  {:else if $currentPage === 'xml'}
    <XmlEditor />
  {:else if $currentPage === 'links'}
    <LinksManager />
  {:else if $currentPage === 'tasks'}
    <TasksManager />
  {:else if $currentPage === 'settings'}
    <Settings />
  {/if}
</Layout>
