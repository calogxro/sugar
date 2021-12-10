/*!
 * Sugar v0.1.0- Rapid web UI prototyping with no server
 * https://github.com/calogxro/sugar
 * Copyright (C) 2021 Calogero Miraglia <calogero.miraglia@gmail.com>
 * Licensed under GNU General Public License v3.0
 * See file https://github.com/calogxro/sugar/LICENSE
 */

// Register the service worker
function sugar(callback) {
    if ('serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
            //console.log("controller")
            callback()
        } else {
            navigator.serviceWorker.oncontrollerchange = function() {
                this.controller.onstatechange = function() {
                    if (this.state === 'activated') {
                        //console.log("onstatechange: activated")
                        callback()
                    }
                }
            }

            navigator.serviceWorker.register('sweetness.js', {
                scope: '/'
            })
            .then(function(reg) {
                // registration worked
                //console.log('Registration succeeded. Scope is ' + reg.scope)
            })
            .catch(function(error) {
                // registration failed
                //console.log('Registration failed with ' + error)
            })
        }
    }
}