# Pyrite

![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)

Pyrite is a video conferencing PWA for the [Galène](https://github.com/jech/galene) SFU. Pyrite's purpose is to establish an extendable 
component-based (Vue 3) frontend for Galène, with additional features like 
i18n, customizable theming, PWA modus, context-aware UX controls, an admin 
interface and more. You're free to try out the public [Pyrite server](https://pyrite.video) to get an idea about Pyrite. The *develop* branch is continuously deployed on the [beta server](https://beta.pyrite.video).

## Getting started

**requirements:** Docker, Docker-compose & Node.js

* Install Pyrite locally

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i
  # Start Galène
  npm run galene
  # Start frontend development tool
  npm run dev
  ```

* [Open Pyrite](http://localhost:3000) in a browser and login to the pyrite channel
  using `pyrite` as user and `1234` as password

* Open an extra browser with a fake webcam device

  ```bash
  chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp
  ```

* Login with the second browser using a random username and password

## Deployment

* Setup the [Galène SFU](https://github.com/garage44/pyrite/wiki/SFU-Config)
* Setup a [proxy](https://github.com/garage44/pyrite/wiki/Proxy-Config) for your domain
