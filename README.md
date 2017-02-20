# EHRaS Backend

Main engine.

Please test with `npm test` and lint with `npm run lint` before PRing.

Set configuration in `data\config.js`; you'll need to rename the example file.

Fill your SSL certs as outlined in `bin/www` in the `data/ssl` folder.

# Basic routes

## POST /data
Accepts the form-urlencoded data as a new patient and returns the UUID in the header XCreated-ID

## GET /data/:id
Accepts a UUID as an url param and returns the client data

## PATCH /data/:id
Accepts a UUID as an url param and an updated payload in form-urlencoded form
