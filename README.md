# Pyrite

Pyrite is a frontend for the [Galène](https://github.com/jech/galene) video
conferencing server. Pyrite is a functional mix of the Galène frontend and the
[CA11 project](https://github.com/open-voip-alliance/ca11). Pyrite's initial
goal is to match the functionality of the default Galène frontend, while using
a [Vue 3](https://v3.vuejs.org/) component-based architecture. The
[Vite](https://github.com/vitejs/vite) build tool provides a pleasant
developer experience with HMR, while semantic versioning and auto-deployment
makes Pyrite easy to deploy.

## Development

```bash
git clone git@github.com:garage44/pyrite.git
cd pyrite
npm i
npm run dev
# Start Galene in another tab
./galene --insecure
# Open localhost:3000 in a Chromium browser
```

> In case you have to test with multiple webcams, you can spin up a browser
> with a fake webcam device using:

```bash
# Start a second browser with a fake webcam
chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=/home/user/.chromium-tmp
```

## Deployment

* Setup the [SFU](https://github.com/garage44/pyrite/wiki/SFU-Config)
* Setup a NGINX [proxy](https://github.com/garage44/pyrite/wiki/Proxy-Config) for your domain
* Start Galène
