const fs = require('fs')
const vm = require('vm')
const test = require('tape')

const dotenvxContent = fs.readFileSync('src/dotenvx.js', 'utf-8')
vm.runInThisContext(dotenvxContent)

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

test('#environments', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile)
  const environments = dotenvx.environments()

  ct.same(environments, ['development', 'production'])

  ct.end()
})

test('#object', ct => {
  const dotenvx = new Dotenvx(envVaultFile, envKeysFile)
  const object = dotenvx.object()

  const expected = {
    development: {},
    production: {}
  }

  ct.same(object, expected)

  ct.end()
})
