/*!
 * Sugar v0.1.0 - Rapid web UI prototyping with no server
 * https://github.com/calogxro/sugar
 * Copyright (C) 2021 Calogero Miraglia <calogero.miraglia@gmail.com>
 * Licensed under GNU General Public License v3.0
 * See file https://github.com/calogxro/sugar/LICENSE
 */

// Service worker

//console.log("service worker")

self.importScripts("localforage.min.js")

self.oninstall = function(event) {
    //console.log("oninstall")
    event.waitUntil(self.skipWaiting()) // Activate worker immediately
}

self.onactivate = function(event) {
    //console.log("onactivate")
    event.waitUntil(self.clients.claim()) // Become available to all pages
}

self.onfetch = function(event) {
    var req = event.request

    var regexCollection = new RegExp(`\/api\/[a-z]+\/?$`)
    var regexSingleton = new RegExp(`\/api\/[a-z]+\/[0-9]+\/?$`)
    var regexId = new RegExp(`[0-9]+$`)

    var collectionReq = regexCollection.test(req.url)
    var singletonReq = regexSingleton.test(req.url)

    if (!collectionReq && !singletonReq) {
        // It's not a call to api/{resource}
        fetch(req)
        return
    }

    var resourceName = ""
    var urlParts = req.url.split('/')

    if (collectionReq) {
        resourceName = urlParts[urlParts.length-1]
    } else if (singletonReq) {
        resourceName = urlParts[urlParts.length-2]
    }

    event.respondWith(async function() {
        var nextId = 1
        var collection = await localforage.getItem(resourceName)

        if (! collection) {
            collection = new Map()
        } else {
            for (const [id, resource] of collection) {
                if (id >= nextId) {
                    nextId = id + 1
                }
            }
        }

        if (collectionReq) {
            switch(req.method) {
                case 'GET':
                    //console.log(collection)
                    var json = JSON.stringify([...collection.values()])
                    return new Response(json, {
                        headers: { 'Content-Type': 'application/json' }
                    })
                case 'POST':
                    var resource = await req.json()
                    //console.log(resource)
                    resource.id = nextId++
                    collection.set(resource.id, resource)
                    await localforage.setItem(resourceName, collection)
                    return new Response(JSON.stringify(resource), { 
                        status: 201 
                    })
            }
        } else if (singletonReq) {
            var found = req.url.match(regexId)
            var id = parseInt(found[0])

            if (! collection.has(id)) {
                return new Response({ status: 404 })
            }

            switch(req.method) {
                case 'GET':
                    var resource = collection.get(id)
                    var json = JSON.stringify(resource)
                    return new Response(json, {
                        headers: { 'Content-Type': 'application/json' }
                    })
                case 'DELETE':
                    collection.delete(id)
                    await localforage.setItem(resourceName, collection)
                    return new Response({ status: 204 })
                case 'PUT':
                    var resource = await req.json()
                    collection.set(id, resource)
                    await localforage.setItem(resourceName, collection)
                    return new Response({ status: 204 })
                case 'PATCH':
                    var resource = await req.json()
                    let targetResource = collection.get(id)
                    targetResource = Object.assign(targetResource, resource)
                    collection.set(id, targetResource)
                    await localforage.setItem(resourceName, collection)
                    return new Response({ status: 204 })
            }
        }
    }())
}