class Dotenvx {
  constructor(envVaultFile, envKeysFile) {
    this.envVaultFile = envVaultFile
    this.envKeysFile = envKeysFile

    this.LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg
  }

  object () {
    const obj = {}
    const environments = this.environments()

    for (const environment of environments) {
      obj[environment] = {}
    }

    return obj
  }

  environments() {
    const obj = this._envVaultParsed()
    const prefix = 'DOTENV_VAULT_'
    const environments = []

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key.startsWith(prefix)) {
        const environment = key.replace(prefix, '').toLowerCase()

        if (environment) {
          environments.push(environment)
        }
      }
    }

    return environments
  }

  _envVaultParsed() {
    return this._parse(this.envVaultFile)
  }

  _envKeysParsed() {
    return this._parse(this.envKeysFile)
  }

  // Parse src into an Object
  _parse (src) {
    const obj = {}

    // Convert buffer to string
    let lines = src.toString()

    // Convert line breaks to same format
    lines = lines.replace(/\r\n?/mg, '\n')

    let match
    while ((match = this.LINE.exec(lines)) != null) {
      const key = match[1]

      // Default undefined or null to empty string
      let value = (match[2] || '')

      // Remove whitespace
      value = value.trim()

      // Check if double quoted
      const maybeQuote = value[0]

      // Remove surrounding quotes
      value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

      // Expand newlines if double quoted
      if (maybeQuote === '"') {
        value = value.replace(/\\n/g, '\n')
        value = value.replace(/\\r/g, '\r')
      }

      // Add to object
      obj[key] = value
    }

    return obj
  }
}
