# EHRaS Backend

Main engine.

Please test with `npm test` and lint with `npm run lint` before PRing.

Set configuration in `data\config.js`; you'll need to rename the example file.

Fill your SSL certs as outlined in `bin/www` in the `data/ssl` folder.

# Basic routes

## POST /data
Accepts the form-urlencoded data as a new patient and returns the UUID in the header `XCreated-ID`. HTTP 201 Created indicates successful creation. 400 indicates error state.

## GET /data/:id
Accepts a UUID as an url param and returns the client data. HTTP 200 indicates successful retrieval. 400 indicates error state. 404 indicates no record found.

## PATCH /data/:id
Accepts a UUID as an url param and an updated payload in form-urlencoded form. HTTP 2014 No Response indicates success (no data will be returned). 400 indicates error state.
