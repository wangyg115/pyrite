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
  # Start Galène
  npm run galene
  # Start the Pyrite frontend
  npm run dev
  ```

[Open a browser](http://localhost:3000) and login to the pyrite channel
as Operator (`pyrite`/`1234`). Open another browser on the same machine
using a fake webcam device:

```bash
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp http://localhost:3000
```

> Login using the second browser using a random username and password, e.g. `tester`/`tester`.

## Deployment

If you want to organise multi-machine video conferences, you need to setup
Pyrite and Galène on a HTTPS hosted machine. Learn more about deployment
from the [documentation](./docs/index.md).
