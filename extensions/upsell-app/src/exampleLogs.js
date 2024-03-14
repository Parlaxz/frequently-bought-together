/**
 *! cart Lines:
 *,  "lines": [
 *,       {
 *,       "quantity": 3,
 *,      "merchandise": {
 *,        "__typename": "ProductVariant",
 *,        "id": "gid://shopify/ProductVariant/47163121926446",
 *,        "product": {
 *,          "id": "gid://shopify/Product/8788452540718"
 *,        }
 *,      },
 *,      "attribute": null
 *,    },
 *,    {
 *,      "quantity": 5,
 *,      "merchandise": {
 *,       "__typename": "ProductVariant",
 *,       "id": "gid://shopify/ProductVariant/47163122647342",
 *,       "product": {
 *,         "id": "gid://shopify/Product/8788453294382"
 *,       }
 *,     },
 *,     "attribute": {
 *,       "key": "__promotionData",
 *,       "value": "{\"frequentlyBoughtTogether\":{\"promotionId\":\"fm0qj164i\",\"itemIds\":[\"gid://shopify/Product/8788453294382\",8788452540718]},\"volumeDiscount\":{\"promotionId\":null},\"addonDiscount\":{\"promotionId\":null,\"itemIds\":[]},\"collections\":[],\"tags\":[]}"
 *,     }
 *,   },
 *,   {
 *,     "quantity": 25,
 *,     "merchandise": {
 *,       "__typename": "ProductVariant",
 *,       "id": "gid://shopify/ProductVariant/47163121926446",
 *,       "product": {
 *,         "id": "gid://shopify/Product/8788452540718"
 *,       }
 *,     },
 *,     "attribute": {
 *,       "key": "__promotionData",
 *,       "value": "{\"frequentlyBoughtTogether\":{\"promotionId\":\"fm0qj164i\",\"itemIds\":[\"gid://shopify/Product/8788453294382\",8788452540718]},\"volumeDiscount\":{\"promotionId\":null},\"addonDiscount\":{\"promotionId\":null,\"itemIds\":[]},\"collections\":[],\"tags\":[]}"
 *,     }
 *,   }
 *, ]
 */
/**
 *! atcPromotionsMap {
 *, "frequentlyBoughtTogether": [
 *,   {
 *,     "promotionId": "fm0qj164i",
 *,     "itemIds": [
 *,       8788453294382,
 *,       8788452540718
 *,     ]
 *,   }
 *, ],
 *, "addonDiscount": [],
 *, "volumeDiscount": []
 *, }
 */
/**
 *!       storePromotions: [{
 *,               "title": "Collection Test",
 *,               "method": "Automatic",
 *,               "code": "",
 *,               "id": "ubokv2zfq",
 *,              "configuration": {
 *,                       "target": {
 *,                              "type": "collection",
 *,                              "value": [
 *,                                      {
 *,                                      "id": "gid://shopify/Collection/461880197422",
 *,                                      "title": "Hydrogen",
 *,                                      "handle": "hydrogen"
 *,                                      }
 *                               ,]
 *,                      },
 *,                      "offerItems": {
 *,                             "type": "collection",
 *,                              "value": [
 *,                                      {
 *,                              "id": "gid://shopify/Collection/461880197422",
 *,                              "title": "Hydrogen",
 *,                              "handle": "hydrogen"
 *,                              }
 *,                                      ],
 *,                              "numItems": 1
 *,                      },
 *,                      "offerDiscount": {
 *,                              "type": "percentage",
 *,                              "value": "0",
 *,                              "offerOnly": false
 *,                      },
 *,                      "metadata": {
 *,                              "discountMessage": "Test",
 *,                              "title": "Collection Test",
 *,                              "appliesTo": "all",
 *,                      }
 *,              }
 *,      },
 *, ...
 *,]
 */
/**
  * !lineItemDiscounts {
* ,                   "47163121926446": {
                         "variantId": 47163121926446,
                        "productId": 8788452540718,
                        "quantity": 51,
                        "discounts": [
                        {
                                "type": "percentage",
                                "value": "0",
                                "message": "Test"
                        }
                        ]
                        },
                        "47163122647342": {
                        "variantId": 47163122647342,
                        "productId": 8788453294382,
                        "quantity": 5,
                        "discounts": [
                        {
                                "type": "percentage",
                                "value": "0",
                                "message": "Test"
                        }
                        ]
                        }
                        } */
