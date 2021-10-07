require('dotenv').config()

const { JsonRpc, Api, JsSignatureProvider } = require('@proton/js')
const fetch = require('node-fetch')

// Constants
const ENDPOINT = 'https://proton.eoscafeblock.com'
const CREATOR = 'bulls'
const CREATOR_PERMISSION = 'active'
const COLLECTION_NAME = 'zerogravityz'
const SCHEMA_NAME = 'minimal'
const CREATOR_FEE = 0.01
const SCHEMA = {
    image: "string",
    name: "string"
}

// NOTE: template_id must be manually inputted after `createTemplates()` is called, check proton.bloks.io
const templates = [
    { template_id: 24, max_supply: 10000, name: 'Zero Gravity', image: 'QmfYYzcPbyboBnP8JRnGmXhzkEYWYyRGtFQhrV86QHHVXB' }
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
            blocksBehind: 3,
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
              "collection_name": COLLECTION_NAME,
              "schema_name": SCHEMA_NAME,
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
        console.count('Minted')
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

const allInOne = async () => {
    await transact([
        {
            "account": "atomicassets",
            "name": "createcol",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION
            }],
            "data": {
                "author": CREATOR,
                "collection_name": COLLECTION_NAME,
                "allow_notify": true,
                "authorized_accounts": [CREATOR, "specialmint"],
                "notify_accounts": [],
                "market_fee": CREATOR_FEE,
                "data": []
            }
        },
        {
            "account": "atomicassets",
            "name": "createschema",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION,
            }],
            "data": {
              "authorized_creator": CREATOR,
              "collection_name": COLLECTION_NAME,
              "schema_name": SCHEMA_NAME,
              "schema_format": Object.entries(SCHEMA).map(([key, type]) => ({
                  name: key,
                  type: type
              }))
            }
        },
        {
            "account": "atomicassets",
            "name": "createtempl",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION
            }],
            "data": {
              "authorized_creator": CREATOR,
              "collection_name": COLLECTION_NAME,
              "schema_name": SCHEMA_NAME,
              "transferable": true,
              "burnable": true,
              "max_supply": templates[0].max_supply,
              "immutable_data": Object.entries(SCHEMA).map(([key, type]) => ({
                  key: key,
                  value: [type, templates[0][key]]
              }))
            }
        },
        {
            "account": "specialmint",
            "name": "mintlasttemp",
            "authorization": [{
                "actor": CREATOR,
                "permission": CREATOR_PERMISSION
            }],
            "data": {
                "creator": CREATOR,
                "collection_name": COLLECTION_NAME,
                "schema_name": SCHEMA_NAME,
                "new_asset_owner": CREATOR,
                "immutable_data": [],
                "mutable_data": []
            }
        }
    ])
}

const main = async () => {
    // await createCollection()
    // await createSchema()
    // await createTemplates()
    // await mintAssets()

    await allInOne()
}

main()