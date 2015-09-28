
export default {
  "data": [
    {
      "type": "productTemplatePairs",
      "id": "1-28-26",
      "relationships": {
        "product": {
          "data": {
            "type": "products",
            "id": "1"
          }
        },
        "face": {
          "data": {
            "type": "faces",
            "id": "26"
          }
        },
        "template": {
          "data": {
            "type": "templates",
            "id": "28"
          }
        }
      }
    },
    {
      "type": "productTemplatePairs",
      "id": "1-29-26",
      "relationships": {
        "product": {
          "data": {
            "type": "products",
            "id": "1"
          }
        },
        "face": {
          "data": {
            "type": "faces",
            "id": "26"
          }
        },
        "template": {
          "data": {
            "type": "templates",
            "id": "29"
          }
        }
      }
    }
  ],
  "included": [
    {
      "type": "templates",
      "id": 28,
      "attributes": {
        "account": 1,
        "ownerUser": null,
        "name": "Plastic 1",
        "description": null
      }
    },
    {
      "type": "templates",
      "id": 29,
      "attributes": {
        "account": 1,
        "ownerUser": null,
        "name": "Plastic 2",
        "description": null
      }
    },
    {
      "type": "products",
      "id": 1,
      "attributes": {
        "account": 1,
        "name": "With face + background",
        "description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
        "isCustomizable": true
      }
    },
    {
      "type": "faces",
      "id": 26,
      "attributes": {
        "template": null,
        "product": 1,
        "design": null,
        "baseRecord": null,
        "ratio": "",
        "name": "front",
        "isPrimary": true,
        "width": 18,
        "height": 24,
        "unit": null,
        "xInsideBackground": -516,
        "yInsideBackground": -234,
        "scaleInsideBackground": 0.0833333,
        "backgroundImage": "https://www.filepicker.io/api/file/TPj8agWQS4WhsBKC6pzs",
        "backgroundImageWidth": 900,
        "backgroundImageHeight": 620,
        "baseRecordSnapshot": null,
        "createdAt": "2015-06-17T21:07:44.000Z",
        "updatedAt": "2015-09-10T23:40:02.000Z"
      }
    }
  ]
};
