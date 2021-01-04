# Pyrite

This is an experimental port of the [Galène](https://github.com/jech/galene) video
conferencing server frontend. Pyrite's initial goal is to mimick the original
Galène frontend with a [Vue 3](https://v3.vuejs.org/) component-based application.
The [Vite](https://github.com/vitejs/vite) build tool, semantic versioning and
auto-deployment makes it easy to quickly release and deploy new versions and
separate code across files.

## Setup

* Start the Pyrite development service

```bash
git clone git@github.com:garage44/pyrite.git
npm install
npm run dev
# Start a second browser with a fake webcam
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp
```

* Start Galène

```bash
./galene --insecure
```

> Checkout the install intructions for more info.
