const fs = require('fs')
const vm = require('vm')
const test = require('tape')
const crypto = require('crypto')
const Dotenvx = require('../src/dotenvx.js')

let envVaultFile = `
#/-------------------.env.vault---------------------/
#/         cloud-agnostic vaulting standard         /
#/   [how it works](https://dotenv.org/env-vault)   /
#/--------------------------------------------------/

# development
DOTENV_VAULT_DEVELOPMENT="V4NYVn0Pow6Uf2ez2mbHEzTrYURloHL6VDAFRLqnQBppA/OmHI5x5AXoxCMVor7wOg=="

# production
DOTENV_VAULT_PRODUCTION="YZkhtbh1IlzBgIamAAsG5nzGPfH6p8Zbuj9egXoziviVu/eYIyNjJWtIYyhiW/vHhFbqbsvo5+P9b27OC6ZC7qU="
`

let envKeysFile = `
#/!!!!!!!!!!!!!!!!!!!.env.keys!!!!!!!!!!!!!!!!!!!!!!/
#/   DOTENV_KEYs. DO NOT commit to source control   /
#/   [how it works](https://dotenv.org/env-keys)    /
#/--------------------------------------------------/
DOTENV_KEY_DEVELOPMENT="dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development"
DOTENV_KEY_PRODUCTION="dotenv://:key_10283719af6a30ef49050048617f4fea10c23a38021fbebeb9fd858caa01852e@dotenvx.com/vault/.env.vault?environment=production"
`

test('#dotenvKeys', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)
  const dotenvKeys = dotenvx.dotenvKeys()

  const expected = {
    development: 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development',
    production: 'dotenv://:key_10283719af6a30ef49050048617f4fea10c23a38021fbebeb9fd858caa01852e@dotenvx.com/vault/.env.vault?environment=production'
  }

  ct.same(dotenvKeys, expected)

  ct.end()
})

test('#environments', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)
  const environments = dotenvx.environments()

  ct.same(environments, ['development', 'production'])

  ct.end()
})

test('#decryptKey', ct => {
  const dotenvKey = 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development'
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)
  const decryptKey = dotenvx.decryptKey(dotenvKey)

  ct.same(decryptKey, 'e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4')

  ct.end()
})

test('#decrypt', async ct => {
  const dotenvKey = 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development'
  const encrypted = 'V4NYVn0Pow6Uf2ez2mbHEzTrYURloHL6VDAFRLqnQBppA/OmHI5x5AXoxCMVor7wOg=='
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)
  const decryptKey = dotenvx.decrypt(encrypted, dotenvKey)

  const expected = `# .env
HELLO="World"
`

  const decrypted = await dotenvx.decrypt(encrypted, dotenvKey)

  ct.same(decrypted, expected)
  ct.end()
})

test('#json', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)

  const expected = {
    development: {
      dotenvKey: 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development',
      encrypted: 'V4NYVn0Pow6Uf2ez2mbHEzTrYURloHL6VDAFRLqnQBppA/OmHI5x5AXoxCMVor7wOg==',
      decrypted: '# .env\nHELLO="World"\n'
    },
    production: {
      dotenvKey: 'dotenv://:key_10283719af6a30ef49050048617f4fea10c23a38021fbebeb9fd858caa01852e@dotenvx.com/vault/.env.vault?environment=production',
      encrypted: 'YZkhtbh1IlzBgIamAAsG5nzGPfH6p8Zbuj9egXoziviVu/eYIyNjJWtIYyhiW/vHhFbqbsvo5+P9b27OC6ZC7qU=',
      decrypted: '# .env.production\nHELLO="production"\n'
    }
  }

  dotenvx.json(function(json) {
    ct.same(json, expected)

    ct.end()
  })
})

test('#json (decryption fails)', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)

  const expected = {
    development: {
      dotenvKey: 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development',
      encrypted: 'V4NYVn0Pow6Uf2ez2mbHEzTrYURloHL6VDAFRLqnQBppA/OmHI5x5AXoxCMVor7wOg==',
      decrypted: '# .env\nHELLO="World"\n'
    },
    production: {
      dotenvKey: 'dotenv://:key_10283719af6a30ef49050048617f4fea10c23a38021fbebeb9fd858caa01852e@dotenvx.com/vault/.env.vault?environment=production',
      encrypted: 'YZkhtbh1IlzBgIamAAsG5nzGPfH6p8Zbuj9egXoziviVu/eYIyNjJWtIYyhiW/vHhFbqbsvo5+P9b27OC6ZC7qU=',
      decrypted: '# .env.production\nHELLO="production"\n'
    }
  }

  dotenvx.json(function(json) {
    ct.same(json, expected)

    ct.end()
  })
})

test('#_extractPassword', ct => {
  const dotenvKey = 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development'

  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)

  const password = dotenvx._extractPassword(dotenvKey)

  ct.same(password, 'key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4')

  ct.end()
})

test('#_extractEnvironment', ct => {
  const dotenvKey = 'dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development'

  const dotenvx = new Dotenvx(envVaultFile, envKeysFile, crypto)

  const password = dotenvx._extractEnvironment(dotenvKey)

  ct.same(password, 'development')

  ct.end()
})
