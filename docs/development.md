
# Development

```bash
git clone git@github.com:garage44/pyrite.git
cd pyrite
npm i  # Install dependencies
npm run galene  # Run dockerized galene
# Uses Nodemon autoreload. Use PYRITE_NO_SECURITY=1 to bypass session security
nodemon admin/app.js
# Vite development server with proxy
npm run dev
```
