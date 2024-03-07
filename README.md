# dotenvx-script

decrypt `.env.vault` files in browser

&nbsp;

### Quickstart

Include the `<script>` and then return the json object containing the decrypted values.

```html
<html>
<body>
  <script src="../src/dotenvx.js"></script>
  <script>
    var envVaultFile = `
    #/-------------------.env.vault---------------------/
    #/         cloud-agnostic vaulting standard         /
    #/   [how it works](https://dotenv.org/env-vault)   /
    #/--------------------------------------------------/

    # development
    DOTENV_VAULT_DEVELOPMENT="V4NYVn0Pow6Uf2ez2mbHEzTrYURloHL6VDAFRLqnQBppA/OmHI5x5AXoxCMVor7wOg=="

    # production
    DOTENV_VAULT_PRODUCTION="YZkhtbh1IlzBgIamAAsG5nzGPfH6p8Zbuj9egXoziviVu/eYIyNjJWtIYyhiW/vHhFbqbsvo5+P9b27OC6ZC7qU="
    `

    var envKeysFile = `
    #/!!!!!!!!!!!!!!!!!!!.env.keys!!!!!!!!!!!!!!!!!!!!!!/
    #/   DOTENV_KEYs. DO NOT commit to source control   /
    #/   [how it works](https://dotenv.org/env-keys)    /
    #/--------------------------------------------------/
    DOTENV_KEY_DEVELOPMENT="dotenv://:key_e507c60efa8841d8d5bbb85bd701ee92406cf3b06506d1d80f1553c2a72791e4@dotenvx.com/vault/.env.vault?environment=development"
    DOTENV_KEY_PRODUCTION="dotenv://:key_10283719af6a30ef49050048617f4fea10c23a38021fbebeb9fd858caa01852e@dotenvx.com/vault/.env.vault?environment=production"
    `

    const dotenvx = new Dotenvx(envVaultFile, envKeysFile)
    dotenvx.json(function(json) {
      console.log('json', json)
    })
  </script>
</body>
</html>
```

&nbsp;
