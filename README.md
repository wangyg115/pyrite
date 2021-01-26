# Pyrite

Pyrite is an alternative frontend for [Galène](https://github.com/jech/galene)
that is based on the [original frontend](https://github.com/jech/galene/blob/master/static/galene.js), using the reference [client protocol](https://github.com/jech/galene/blob/master/static/protocol.js). Pyrite's purpose is to provide a reactive, component-based
application with at least the same feature-set as the original frontend.

![Pyrite](https://pyrite.video/screenshots/pyrite-1.1.png)

## Getting started

**requirements:** Docker, Docker-compose & Node.js

* Install Pyrite locally

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i
  # Start Galene
  npm run galene
  # Start frontend development tool
  npm run dev
  ```

* [Open Pyrite](http://localhost:3000) in a browser

> Spin up an extra fake webcam with:

```bash
# Start a second browser with a fake webcam
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp
```

## Deployment

* Setup the [Galène SFU](https://github.com/garage44/pyrite/wiki/SFU-Config)
* Setup a NGINX [proxy](https://github.com/garage44/pyrite/wiki/Proxy-Config) for your domain
