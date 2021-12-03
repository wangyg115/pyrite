# Proxy Config

This is an example Nginx configuration to use with the Galène and Pyrite services
that were previously installed. Free Let's encrypt certificates are used for the
HTTPS connection. Checkout the [certbot](https://wiki.archlinux.org/title/Certbot)
documentation on how to generate certificates for your own domain.

```bash
server {
    listen 80;
    listen [::]:80;
    server_name pyrite.video;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pyrite.video;
    index index.html;

    access_log /var/log/nginx/pyrite.video.access.log;
    error_log /var/log/nginx/pyrite.video.error.log;

    location /ws {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:8443;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    location ~ ^/(public-groups.json|ice-servers.json) {
        proxy_pass http://127.0.0.1:8443;
    }

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
    }

    ssl_certificate /etc/letsencrypt/live/pyrite.video/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/pyrite.video/privkey.pem; # managed by Certbot
}
```
