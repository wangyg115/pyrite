<img height="100" src="../ui/public/logo-text.svg">

# Documentation

1. [Usage](./usage.md) - How to use Pyrite
2. [Services](./systemd.md) - Systemd setup
3. [Proxy](./proxy.md) - NGINX configuration

![Pyrite screenshot](./pyrite.png "Pyrite")

## FAQ

### What is the purpose of pyrite.video?

This is a service that is solely meant for testing purposes on a small scale.
It is not meant as an attempt to launch another video-conferencing service,
so please setup your own server.

### My browser shows a whitescreen

Try to clear the browser cache and unregister the service worker from devtools.
Pyrite uses a service worker, which sometimes incorrectly caches files.
