<img height="100" src="./media/logo-text.svg">

![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)

[Pyrite](https://pyrite.video) with [Galène](https://github.com/jech/galene) is a self-hosted
video conferencing solution (SFU) based on [Vue](https://v3.vuejs.org/) & [Pion](https://github.com/pion/webrtc).

## Getting started

**requirements:** Docker, Docker-compose & Node.js

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i
  # Start Galène SFU with non-root user
  export UID=$(id -u)
  export GID=$(id -g)
  npm run galene
  # Start Pyrite services
  npm run dev --workspace=packages/gui
  npm run dev --workspace=packages/admin
  ```

[Open Pyrite](http://localhost:3000) in the browser and toggle
the operator modus by clicking twice on the logo, until the screen
turns red. The administrator password is located in data/passwd.

### Multiple browsers

Open another browser on the same machine using a fake webcam device:

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3000
```

> Login using the second browser using a random username and password, e.g. `tester`/`tester`.

### Deployment

Serving Pyrite & Galène on a network requires a HTTPS deployment. Checkout the [documentation](./docs/index.md)
for a deployment example.
