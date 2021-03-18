Create Collection
```
cleosp push transaction '{
  "actions": [
    {
      "account": "atomicassets",
      "name": "createcol",
      "authorization": [{
          "actor": "monsters",
          "permission": "active"
        }
      ],
      "data": {
        "author": "monsters",
        "collection_name": "monsters",
        "allow_notify": true,
        "authorized_accounts": ["monsters"],
        "notify_accounts": [],
        "market_fee": 0.01,
        "data": [
          {"key": "description", "value": ["string", "Monsters on Proton!"]}
        ]
      }
    }
  ]
}'
```

Create Schema
```
cleospt push transaction '{
  "actions": [
    {
      "account": "atomicassets",
      "name": "createschema",
      "authorization": [{
          "actor": "monsters",
          "permission": "active"
        }
      ],
      "data": {
        "authorized_creator": "monsters",
        "collection_name": "monsters",
        "schema_name": "monsters",
        "schema_format": [
            {"name": "series", "type": "uint16"},
            {"name": "image", "type": "image"},
            {"name": "name", "type": "string"}
        ]
      }
    }
  ]
}'
```

Create Template
```
cleospt push transaction '{
  "actions": [
    {
      "account": "atomicassets",
      "name": "createtempl",
      "authorization": [{
          "actor": "monsters",
          "permission": "active"
        }
      ],
      "data": {
        "authorized_creator": "monsters",
        "collection_name": "monsters",
        "schema_name": "monsters",
        "transferable": true,
        "burnable": true,
        "max_supply": 100,
        "immutable_data": [
            {"key": "series", "value": ["uint16", "1"]},
            {"key": "image", "value": ["string", "QmejwojCLwjbNxqVNwBhyvKj5jUM4kGsm4tGM2U8CbniXy"]},
            {"key": "name", "value": ["string", "Cerberus"]}
        ]
      }
    }
  ]
}'
```