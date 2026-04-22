<script lang="ts">
  import { settings } from "../stores/settings.ts";
  import { editorData } from "../stores/navigation.ts";
  import { environments } from "../stores/environments.ts";
  import { toastStore } from "../stores/toast.ts";
  import { onMount } from "svelte";
  import { ExternalLink, AlignLeft } from "lucide-svelte";
  import CodeEditor from "./CodeEditor.svelte";

  let xmlToken = "";
  let decodedXml = "";
  let apiBase = "http://localhost";

  $: {
    const activeEnv = $environments.find((env) => env.isActive) || $environments[0];
    if (activeEnv?.url_api) {
      apiBase = activeEnv.url_api.replace(/\/$/, "");
    }
  }

  const unsubscribe = editorData.subscribe((data) => {
    if (data.xmlToken) {
      xmlToken = data.xmlToken;
      decodedXml = data.decodedXml;
    }
  });

  onMount(() => {
    settings.load();
    environments.load();
    chrome.storage.local.get(["xmlContent", "xmlToken"], (result) => {
      if (result["xmlToken"] && !xmlToken) {
        xmlToken = result["xmlToken"] as string;
        try {
          decodedXml = atob(xmlToken);
        } catch (e) {
          decodedXml = "";
        }
      }
      if (result["xmlContent"] && !decodedXml) {
        decodedXml = result["xmlContent"] as string;
      }
    });
    return () => unsubscribe();
  });

  async function openConnexionPage() {
    const tab = await chrome.tabs.create({ url: `${apiBase}/connexion` });

    setTimeout(async () => {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id as number },
          func: (token: string) => {
            const textarea = document.getElementById("xmltoken") as HTMLTextAreaElement | null;
            if (textarea) {
              textarea.value = token;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            }
          },
          args: [xmlToken],
        });
      } catch (err) {
        console.error("Erreur lors de l'injection du token:", err);
      }
    }, 1000);
  }

  function decodeToken() {
    try {
      decodedXml = atob(xmlToken);
    } catch (e) {
      toastStore.error("Erreur de décodage Base64 : " + (e as Error).message);
    }
  }

  function regenerateToken() {
    try {
      xmlToken = btoa(decodedXml);
    } catch (e) {
      toastStore.error("Erreur d'encodage Base64 : " + (e as Error).message);
    }
  }

  function formatXml() {
    if (!decodedXml.trim()) return;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(decodedXml, "application/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        toastStore.error("XML invalide : impossible de formater");
        return;
      }

      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      decodedXml = formatWithIndentation(formatted);
    } catch (e) {
      toastStore.error("Erreur de formatage XML : " + (e as Error).message);
    }
  }

  function formatWithIndentation(xml: string): string {
    let formatted = "";
    let indent = "";
    const tab = "  ";

    xml = xml.replace(/>\s*</g, "><");

    const tokens = xml.split(/(<[^>]+>)/g).filter((token) => token.length > 0);

    for (let i = 0; i < tokens.length; i++) {
      const node = tokens[i];

      if (!node.trim()) continue;

      if (!node.startsWith("<")) {
        const text = node.trim();
        if (text) {
          formatted += indent + text + "\n";
        }
        continue;
      }

      if (node.match(/^<\//)) {
        indent = indent.substring(tab.length);
        formatted += indent + node + "\n";
        continue;
      }

      if (node.match(/\/>$/)) {
        formatted += indent + node + "\n";
        continue;
      }

      if (node.match(/^<[^?!\/]/)) {
        formatted += indent + node + "\n";
        if (!node.match(/\/>/)) {
          indent += tab;
        }
        continue;
      }

      if (node.match(/^<\?/) || node.match(/^<!--/)) {
        formatted += indent + node + "\n";
        continue;
      }

      if (node.match(/^<!\[/)) {
        formatted += indent + node + "\n";
        continue;
      }

      formatted += indent + node + "\n";
    }

    return formatted.trim();
  }
</script>

<div class="space-y-4 bg-[#f5f5f5] p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Connexion</h1>
  </div>

  <!-- XML Décode avec coloration syntaxique -->
  <div class="bg-white border border-gray-200 rounded overflow-hidden">
    <div
      class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center"
    >
      <span class="text-sm font-medium text-gray-600">XML Décode</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">{decodedXml.length} caractères</span
        >
        <button
          on:click={formatXml}
          disabled={!decodedXml.trim()}
          title="Formater le XML"
          class="text-xs bg-white border border-[#1e3a5f] text-[#1e3a5f] hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 px-2 py-1 rounded flex items-center gap-1"
        >
          <AlignLeft size={12} />
          Formater
        </button>
      </div>
    </div>
    <div class="h-80">
      <CodeEditor
        bind:value={decodedXml}
        placeholder="Le XML décodé apparaîtra ici..."
        spellcheck={false}
        className="xml-editor"
      />
    </div>
  </div>

  <!-- XML Token -->
  <div class="bg-white border border-gray-200 rounded overflow-hidden">
    <div
      class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center"
    >
      <span class="text-sm font-medium text-gray-600">XML Token (Base64)</span>
      <div class="flex gap-2 items-center">
        <span class="text-xs text-gray-400">{xmlToken.length} caractères</span>
        <button
          on:click={decodeToken}
          disabled={!xmlToken}
          class="text-xs bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white px-2 py-1 rounded"
        >
          Décoder
        </button>
        <button
          on:click={regenerateToken}
          disabled={!decodedXml.trim()}
          class="text-xs bg-white border border-[#1e3a5f] text-[#1e3a5f] hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 px-2 py-1 rounded"
        >
          Régénérer
        </button>
      </div>
    </div>
    <textarea
      bind:value={xmlToken}
      placeholder="Collez votre token XML (Base64) ici..."
      class="token-textarea w-full h-28 p-3 font-mono text-xs resize-none focus:outline-none border-0 bg-gray-50"
      spellcheck="false"
    ></textarea>
  </div>

  <!-- Lien vers la page de connexion -->
  <button
    on:click={openConnexionPage}
    class="w-full bg-[#1e3a5f] hover:bg-[#2a4a73] text-white py-3 rounded font-medium transition-colors flex items-center justify-center gap-2"
  >
    <ExternalLink size={20} />
    Ouvrir la page de connexion
  </button>
</div>

<style>
  .token-textarea {
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    line-height: 1.5;
    color: #4a5568;
  }

  :global(.xml-editor) {
    background: #fafafa;
  }
</style>
