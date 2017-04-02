# EHRaS Backend

Main engine.

Please test with `npm test` and lint with `npm run lint` before PRing.

Set configuration in `data\config.js`; you'll need to rename the example file.

Fill your SSL certs as outlined in `bin/www` in the `data/ssl` folder.

# Basic routes

## GET /data/:id
Accepts an encrypted UUID as an url param and returns the client data. HTTP 200 indicates successful retrieval. 400 indicates error state. 404 indicates no record found.

## PATCH /data/:id
Accepts a UUID as an url param and an updated payload in form-urlencoded form. HTTP 2014 No Response indicates success (no data will be returned). 400 indicates error state.

## GET /uuid/new
Returns an encrypted UUID and creates space in the DB for that UUID

## POST /uuid/decrypt
Returns a decrypted UUI when the encrypted UUID is provided as `x-www-form-urlencoded` data with the key `uuid`
