class Dotenvx {
  constructor(envVaultFile, envKeysFile, crypto = window.crypto) {
    this.envVaultFile = envVaultFile
    this.envKeysFile = envKeysFile

    this.LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

    this.crypto = crypto
  }

  async json (callback) {
    const json = {}
    const environments = this.environments()
    const dotenvKeys = this.dotenvKeys()
    const dotenvVaults = this.dotenvVaults()

    for (const environment of environments) {
      const dotenvKey = dotenvKeys[environment]
      const encrypted = dotenvVaults[environment]

      json[environment] = {}
      json[environment]['dotenvKey'] = dotenvKey
      json[environment]['encrypted'] = encrypted
      try {
        json[environment]['decrypted'] = await this.decrypt(encrypted, dotenvKey)
      } catch (error) {
        json[environment]['decrypted'] = null
      }

      if (!dotenvKey) {
        const error = new Error(`missing DOTENV_KEY_${environment.toUpperCase()} (.env.keys)`)
        error.code = 'MISSING_DOTENV_KEY'
        json[environment]['error'] = error

      }
    }

    callback(json)
  }

  dotenvKeys() {
    const obj = this._envKeysParsed()
    const prefix = 'DOTENV_KEY_'
    const out = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key.startsWith(prefix)) {
        const environment = key.replace(prefix, '').toLowerCase()

        if (environment) {
          out[environment] = obj[key] // dotenv://key...
        }
      }
    }

    return out
  }

  dotenvVaults() {
    const obj = this._envVaultParsed()
    const prefix = 'DOTENV_VAULT_'
    const out = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key.startsWith(prefix)) {
        const environment = key.replace(prefix, '').toLowerCase()

        if (environment) {
          out[environment] = obj[key] // encrypted
        }
      }
    }

    return out
  }

  environments() {
    const obj = this.dotenvVaults()

    return Object.keys(obj)
  }

  async decrypt(encrypted, dotenvKey) {
    const environment = this._extractEnvironment(dotenvKey)
    const decryptKey = this.decryptKey(dotenvKey)
    const rawKey = this._fromHex(decryptKey)

    const key = await this.crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt'])

    let ciphertext = this._fromBase64(encrypted)

    // extract nonce and authtag
    const nonce = ciphertext.slice(0, 12)
    const authTag = ciphertext.slice(ciphertext.length - 16)
    ciphertext = ciphertext.slice(12, ciphertext.length - 16)

    // combine ciphertext and authtag
    const data = new Uint8Array(ciphertext.length + authTag.length)
    data.set(ciphertext)
    data.set(authTag, ciphertext.length)

    try {
      const decrypted = await this.crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, data)

      const decoder = new TextDecoder()
      const plaintext = decoder.decode(decrypted)

      return plaintext
    } catch (error) {
      console.error(`${environment}: decrypt() failed`, error)

      throw error
    }
  }

  // inputs a dotenvKey and returns the root decryptionKey portion
  decryptKey (dotenvKey) {
    // Parse DOTENV_KEY. Format is a URI
    let uri
    try {
      uri = new URL(dotenvKey)
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL') {
        const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development')
        err.code = 'INVALID_DOTENV_KEY'
        throw err
      }

      throw error
    }

    // Get decrypt key
    const decryptKey = this._extractPassword(dotenvKey)
    if (!decryptKey) {
      const err = new Error('INVALID_DOTENV_KEY: Missing key part')
      err.code = 'INVALID_DOTENV_KEY'
      throw err
    }

    // get last 64
    return decryptKey.slice(-64)
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

  _extractPassword(uriString) {
    const match = uriString.match(/:\/\/(?:[^:@]*:)?([^@]*)@/)

    if (match) {
      return match[1]
    }

    return null
  }

  _extractEnvironment(uriString) {
    const uri = new URL(uriString)

    return uri.searchParams.get('environment')
  }

  _fromHex(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) // convert key from hex string to buffer
  }

  _fromBase64(base64String) {
    return Uint8Array.from(atob(base64String), c => c.charCodeAt(0))
  }
}

if (typeof window === 'undefined') {
  module.exports = Dotenvx
}
