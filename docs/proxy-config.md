# Proxy Config

This is an example Nginx configuration to use with Galene and Pyrite:

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

    location /deployment {
       proxy_pass http://127.0.0.1:8666;
    }

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
        root /srv/http/pyrite;
        error_page 404 = /index.html;
    }

    ssl_certificate /etc/letsencrypt/live/pyrite.video/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/pyrite.video/privkey.pem; # managed by Certbot
}
```
