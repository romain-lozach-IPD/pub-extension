// Formateur ESLint compatible Node 18 (pas de util.styleText)
export default function formatter(results) {
  let output = ''
  let errorCount = 0
  let warningCount = 0

  for (const result of results) {
    if (result.messages.length === 0) continue
    for (const msg of result.messages) {
      const type = msg.severity === 2 ? 'error' : 'warning'
      const rule = msg.ruleId ? ` (${msg.ruleId})` : ''
      output += `${result.filePath}:${msg.line}:${msg.column}: ${type}: ${msg.message}${rule}\n`
      if (msg.severity === 2) errorCount++
      else warningCount++
    }
  }

  if (errorCount + warningCount > 0) {
    output += `\n${errorCount} erreur(s), ${warningCount} avertissement(s)\n`
  } else {
    output += 'Aucun problème détecté.\n'
  }

  return output
}
