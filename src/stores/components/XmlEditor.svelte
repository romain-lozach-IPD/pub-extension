<script>
  import { settings } from "../stores/settings.js";
  import { editorData } from "../stores/navigation.js";
  import { environments } from "../stores/environments.js";
  import { onMount } from "svelte";
  import { ExternalLink, AlignLeft } from "lucide-svelte";
  import CodeEditor from "./CodeEditor.svelte";

  let xmlToken = "";
  let decodedXml = "";
  let apiBase = "http://localhost";

  // Subscribe to environments to get active environment
  environments.subscribe((envs) => {
    const activeEnv = envs.find((env) => env.isActive) || envs[0];
    if (activeEnv?.url_api) {
      apiBase = activeEnv.url_api.replace(/\/$/, ""); // Remove trailing slash
    }
  });

  // Subscribe to editorData store
  const unsubscribe = editorData.subscribe((data) => {
    if (data.xmlToken) {
      xmlToken = data.xmlToken;
      decodedXml = data.decodedXml;
    }
  });

  onMount(() => {
    settings.load();
    environments.load();
    // Charger le contenu sauvegardé
    chrome.storage.local.get(["xmlContent", "xmlToken"], (result) => {
      if (result.xmlToken && !xmlToken) {
        xmlToken = result.xmlToken;
        try {
          // Just base64 decode, no formatting
          decodedXml = atob(xmlToken);
        } catch (e) {
          decodedXml = "";
        }
      }
      if (result.xmlContent && !decodedXml) {
        decodedXml = result.xmlContent;
      }
    });
    return () => unsubscribe();
  });

  async function openConnexionPage() {
    const tab = await chrome.tabs.create({ url: `${apiBase}/connexion` });

    // Wait a bit for the page to load, then inject the token
    setTimeout(async () => {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (token) => {
            const textarea = document.getElementById("xmltoken");
            if (textarea) {
              textarea.value = token;
              // Trigger input event to notify any listeners
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
      // Just base64 decode, no formatting
      decodedXml = atob(xmlToken);
    } catch (e) {
      alert("Erreur de décodage Base64 : " + e.message);
    }
  }

  function regenerateToken() {
    try {
      // Encode the XML to base64
      xmlToken = btoa(decodedXml);
    } catch (e) {
      alert("Erreur d'encodage Base64 : " + e.message);
    }
  }

  function formatXml() {
    if (!decodedXml.trim()) return;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(decodedXml, "application/xml");

      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        alert("XML invalide : impossible de formater");
        return;
      }

      // Format with indentation
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      decodedXml = formatWithIndentation(formatted);
    } catch (e) {
      alert("Erreur de formatage XML : " + e.message);
    }
  }

  function formatWithIndentation(xml) {
    let formatted = "";
    let indent = "";
    const tab = "  ";

    // Normalize whitespace between tags
    xml = xml.replace(/>\s*</g, "><");

    // Split by tags while keeping them
    const tokens = xml.split(/(<[^>]+>)/g).filter((token) => token.length > 0);

    for (let i = 0; i < tokens.length; i++) {
      let node = tokens[i];

      // Skip pure whitespace nodes
      if (!node.trim()) continue;

      // Handle text content between tags
      if (!node.startsWith("<")) {
        const text = node.trim();
        if (text) {
          formatted += indent + text + "\n";
        }
        continue;
      }

      // Handle closing tag - decrease indent before processing
      if (node.match(/^<\//)) {
        indent = indent.substring(tab.length);
        formatted += indent + node + "\n";
        continue;
      }

      // Handle self-closing tag
      if (node.match(/\/>$/)) {
        formatted += indent + node + "\n";
        continue;
      }

      // Handle opening tag
      if (node.match(/^<[^?!\/]/)) {
        formatted += indent + node + "\n";
        // Increase indent after opening tag (unless it's an empty element)
        if (!node.match(/\/>/)) {
          indent += tab;
        }
        continue;
      }

      // Handle XML declaration and comments
      if (node.match(/^<\?/) || node.match(/^<!--/)) {
        formatted += indent + node + "\n";
        continue;
      }

      // Handle CDATA
      if (node.match(/^<!\[/)) {
        formatted += indent + node + "\n";
        continue;
      }

      // Default: just add the node
      formatted += indent + node + "\n";
    }

    return formatted.trim();
  }
</script>

<div class="space-y-4 max-w-2xl bg-[#f5f5f5] min-h-screen p-4">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-800">Éditeur XML</h1>
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
