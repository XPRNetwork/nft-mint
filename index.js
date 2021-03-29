require('dotenv').config()

const { JsonRpc, Api, JsSignatureProvider } = require('@proton/js')
const fetch = require('node-fetch')

// Constants
const ENDPOINT = 'https://proton.eoscafeblock.com'
const CREATOR = 'monsters'
const CREATOR_PERMISSION = 'active'
const COLLECTION_NAME = 'monsters'
const SCHEMA_NAME = 'monsters'
const CREATOR_FEE = 0.01
const SCHEMA = {
    series: "uint16",
    image: "string",
    name: "string"
}

// NOTE: template_id must be manually inputted after `createTemplates()` is called, check proton.bloks.io
const templates = [
    { template_id: 1, max_supply: 100, series: 1, name: 'Dullahan', image: 'QmT35anF2vLjjfgCQXBXfXqGgXXj4rJrsjcXWYLm9HDfWL' },
    { template_id: 2, max_supply: 200, series: 1, name: 'Minotaur', image: 'Qmd3fNhjZGqKrLjLKNrRue7WqfNErnqgovrVFmS6xCumY6' },
    { template_id: 3, max_supply: 300, series: 1, name: 'Jersey Devil', image: 'QmXM5JC5jhmKNZEfQRazAfEksWmN6YEUDizCWsoGAD1isk' },
    { template_id: 4, max_supply: 400, series: 1, name: 'Misthag', image: 'QmeMzdUpyjPtBpZYgBnxApWETh4Cuo3HavUL63RzAwRcqT' },
    { template_id: 5, max_supply: 500, series: 1, name: 'Draugr', image: 'QmTpSH94BkNJCf82R1WFdPo6NcaiCZJmUdxCgGM2ka2Eue' },
    { template_id: 6, max_supply: 600, series: 1, name: 'Cropsey', image: 'QmPfkthP29F3a4RauRSZnGuMy4QV7bKfS4fvdkUTvGL7Hi' },
    { template_id: 7, max_supply: 700, series: 1, name: 'Typhon', image: 'QmYKrwqVbZAAHjT2BMhzeuFboSybKU7tNGFNgVj15CBy3F' },
    { template_id: 8, max_supply: 800, series: 1, name: 'Ghoul', image: 'QmXniR5MRo7QXG3Eb64jDpz5jyLw14796aAH8A19koHmez' },
    { template_id: 9, max_supply: 900, series: 1, name: 'Wendigo', image: 'QmbaX33qayCBmVqY3xaEX951DgG4nK1osN2RLtetvUdgPi' },
    { template_id: 10, max_supply: 1000, series: 1, name: 'Cerberus', image: 'QmejwojCLwjbNxqVNwBhyvKj5jUM4kGsm4tGM2U8CbniXy' },
]

// RPC
const rpc = new JsonRpc(ENDPOINT, { fetch })
const api = new Api({
    rpc,
    signatureProvider: new JsSignatureProvider([process.env.PRIVATE_KEY])
})

const transact = async (actions) => {
    try {
        await api.transact({ actions }, {
            useLastIrreversible: true,
            expireSeconds: 300
        })
    } catch (e) {
        console.log(e)
    }
}

const createCollection = async () => {
    await transact([
        {
            "account": "atomicassets",
            "name": "createcol",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION
                }
            ],
            "data": {
                "author": CREATOR,
                "collection_name": COLLECTION_NAME,
                "allow_notify": true,
                "authorized_accounts": [CREATOR],
                "notify_accounts": [],
                "market_fee": CREATOR_FEE,
                "data": []
            }
        }
    ])
}

const createSchema = async () => {
    await transact([
        {
            "account": "atomicassets",
            "name": "createschema",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION,
              }
            ],
            "data": {
              "authorized_creator": CREATOR,
              "collection_name": CREATOR,
              "schema_name": CREATOR,
              "schema_format": Object.entries(SCHEMA).map(([key, type]) => ({
                  name: key,
                  type: type
              }))
            }
        }
    ])
}

const createTemplates = async () => {
    for (const template of templates) {
        await transact([
            {
              "account": "atomicassets",
              "name": "createtempl",
              "authorization": [{
                  "actor": CREATOR,
                  "permission": CREATOR_PERMISSION
                }
              ],
              "data": {
                "authorized_creator": CREATOR,
                "collection_name": COLLECTION_NAME,
                "schema_name": SCHEMA_NAME,
                "transferable": true,
                "burnable": true,
                "max_supply": template.max_supply,
                "immutable_data": Object.entries(SCHEMA).map(([key, type]) => ({
                    key: key,
                    value: [type, template[key]]
                }))
              }
            }
        ])
    }
}

const mintAssets = async () => {
    const highToLowMint = templates.sort((t1, t2) => t2 - t1)

    for (let i = 0; i < highToLowMint[0].max_supply; i++) {
        for (const template of templates) {
            if (i >= template.max_supply) {
                continue;
            }

            await transact([
                {
                    "account": "atomicassets",
                    "name": "mintasset",
                    "authorization": [{
                        "actor": CREATOR,
                        "permission": CREATOR_PERMISSION
                    }],
                    "data": {
                        "authorized_minter": CREATOR,
                        "collection_name": COLLECTION_NAME,
                        "schema_name": SCHEMA_NAME,
                        "template_id": template.template_id,
                        "new_asset_owner": CREATOR,
                        "immutable_data": [],
                        "mutable_data": [],
                        "tokens_to_back": []
                    }
                }
            ])
        }
    }
}

const main = async () => {
    await createCollection()
    await createSchema()
    await createTemplates()
    await mintAssets()
}

main()