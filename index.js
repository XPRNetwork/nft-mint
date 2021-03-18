require('dotenv').config()

const { JsonRpc, Api, JsSignatureProvider } = require('@proton/js')
const fetch = require('node-fetch')

const ENDPOINT = 'https://testnet.protonchain.com'
const CREATOR = 'monsters'
const COLLECTION_NAME = 'monsters'
const SCHEMA_NAME = 'monsters'

const rpc = new JsonRpc(ENDPOINT, { fetch })
const api = new Api({ rpc, signatureProvider: new JsSignatureProvider([process.env.PRIVATE_KEY]) })

const templates = [
    { max_supply: 100, series: 1, name: 'Dullahan', image: 'QmT35anF2vLjjfgCQXBXfXqGgXXj4rJrsjcXWYLm9HDfWL' },
    { max_supply: 200, series: 1, name: 'Minotaur', image: 'Qmd3fNhjZGqKrLjLKNrRue7WqfNErnqgovrVFmS6xCumY6' },
    { max_supply: 300, series: 1, name: 'Jersey Devil', image: 'QmXM5JC5jhmKNZEfQRazAfEksWmN6YEUDizCWsoGAD1isk' },
    { max_supply: 400, series: 1, name: 'Misthag', image: 'QmeMzdUpyjPtBpZYgBnxApWETh4Cuo3HavUL63RzAwRcqT' },
    { max_supply: 500, series: 1, name: 'Draugr', image: 'QmTpSH94BkNJCf82R1WFdPo6NcaiCZJmUdxCgGM2ka2Eue' },
    { max_supply: 600, series: 1, name: 'Cropsey', image: 'QmPfkthP29F3a4RauRSZnGuMy4QV7bKfS4fvdkUTvGL7Hi' },
    { max_supply: 700, series: 1, name: 'Typhon', image: 'QmYKrwqVbZAAHjT2BMhzeuFboSybKU7tNGFNgVj15CBy3F' },
    { max_supply: 800, series: 1, name: 'Ghoul', image: 'QmXniR5MRo7QXG3Eb64jDpz5jyLw14796aAH8A19koHmez' },
    { max_supply: 900, series: 1, name: 'Wendigo', image: 'QmbaX33qayCBmVqY3xaEX951DgG4nK1osN2RLtetvUdgPi' },
    { max_supply: 1000, series: 1, name: 'Cerberus', image: 'QmejwojCLwjbNxqVNwBhyvKj5jUM4kGsm4tGM2U8CbniXy' },
]

const toMints = [
    { template_id: 1 }
]

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

const createTemplates = async () => {
    for (const template of templates) {
        await transact([
            {
              "account": "atomicassets",
              "name": "createtempl",
              "authorization": [{
                  "actor": CREATOR,
                  "permission": "active"
                }
              ],
              "data": {
                "authorized_creator": CREATOR,
                "collection_name": COLLECTION_NAME,
                "schema_name": SCHEMA_NAME,
                "transferable": true,
                "burnable": true,
                "max_supply": template.max_supply,
                "immutable_data": [
                    {"key": "series", "value": ["uint16", template.series]},
                    {"key": "image", "value": ["string", template.image]},
                    {"key": "name", "value": ["string", template.name]}
                ]
              }
            }
        ])
    }
}

const main = async () => {
    for (let i = template_start; i <= template_end; i++) {
        for (let j = 0; j < assets_to_mint; j++) {
            await transact([
                {
                    "account": "atomicassets",
                    "name": "mintasset",
                    "authorization": [{
                        "actor": "monsters",
                        "permission": "mint"
                    }
                    ],
                    "data": {
                    "authorized_minter": "monsters",
                    "collection_name": "monsters",
                    "schema_name": "monsters",
                    "template_id": i,
                    "new_asset_owner": "monsters",
                    "immutable_data": [],
                    "mutable_data": [],
                    "tokens_to_back": []
                    }
                }
            ])
        }
    }
}

createTemplates()