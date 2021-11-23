![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

# About

[Pyrite](https://pyrite.video) is a web(RTC) client for the [Galène](https://github.com/jech/galene)
videoconference server. Its purpose is to help establish a self-hosted
[FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) alternative to proprietary
video-conferencing services. The project consists of a [Vue](https://v3.vuejs.org/) PWA and
an [Express](http://expressjs.com/) (Node.js) backend to manage Galène with.

## Getting started

### Requirements

* Docker - Required, unless you build Galène yourself
* Docker-compose - Required, unless you build Galène yourself
* Node.js - Pyrite is a npm-based project

### Installation

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i  # Install dependencies
  npm run galene

  # Config file, mostly for the backend
  cp .pyriterc.example ~/.pyriterc
  # Use PYRITE_NO_SECURITY=1 env to bypass session security
  npm run build
  npm run pyrite
  ```

Open a [browser](http://localhost:3030) and toggle the operator modus by
clicking twice on the logo, until the screen turns red. The initial
administrator password is generated on first use, and is located in
`data/users.json`.

For a quick test, you can also fire up a second browser with a fake WebRTC
device. This can be done with:

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3030
```

Running Pyrite & Galène over a network requires some more configuration.
Checkout the [docs](./docs/index.md) for more information about
the subject.
