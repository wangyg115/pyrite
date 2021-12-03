# Documentation

## Deployment

A basic SFU setup with Pyrite & Galène with systemd services and Nginx as frontend:

1. [Services](./systemd) - Systemd setup
2. [Proxy](./proxy.md) - NGINX configuration

## FAQ

### What is the purpose of the domain pyrite.video?

This is a service that is solely meant for testing purposes on a small scale.
It is not meant as an attempt to launch another video-conferencing service,
so please setup your own server.

### My browser shows a whitescreen

Try to clear the browser cache and unregister the service worker from devtools.
Pyrite uses a service worker, which sometimes incorrectly caches files.
