# Pyrite

![Pyrite](https://pyrite.video/screenshots/pyrite-1.5.png)

Pyrite is a video conferencing PWA for the [Galène](https://github.com/jech/galene)
Video Conferencing server. Pyrite's purpose is to develop an extendable reactive,
component-based (Vue3/Vitejs) frontend that has the same rich feature-set as the
original frontend, while extending it with features like i18n, customizable theming,
PWA modus, advanced device config, context-aware UX controls and more.

## Local setup

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
* Setup a [proxy](https://github.com/garage44/pyrite/wiki/Proxy-Config) for your domain
