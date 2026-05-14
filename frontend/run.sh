#!/bin/bash

echo "🚀 Starting E-Commerce MERN Deployment..."

# -------------------------------
# 1. System setup
# -------------------------------
sudo apt update -y
sudo apt install nginx git curl -y

# -------------------------------
# 2. Install NVM + Node 20
# -------------------------------
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

export NVM_DIR="$HOME/.nvm"
\. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

# -------------------------------
# 3. Install PM2
# -------------------------------
npm install -g pm2

# -------------------------------
# 4. Fix RAM
# -------------------------------
sudo fallocate -l 1G /swapfile || true
sudo chmod 600 /swapfile
sudo mkswap /swapfile || true
sudo swapon /swapfile || true

# -------------------------------
# 5. Clone Project
# -------------------------------
cd ~
rm -rf CC-ECommerce
git clone https://github.com/adityabhalgat/CC-ECommerce.git
cd CC-ECommerce

# -------------------------------
# 6. Backend Setup
# -------------------------------
cd backend

npm install

cat <<EOT > .env
PORT=4000
MONGODB_URI=mongodb+srv://123456789:123456789_987654321@studentrecords.o1opu8e.mongodb.net/?retryWrites=true&w=majority&appName=StudentRecords
MONGODB_DB_NAME=ecommerce_db
FRONTEND_ORIGIN=http://$(curl -s ifconfig.me)
EOT

pm2 delete all
pm2 start src/server.js --name ecommerce-backend
pm2 save

# -------------------------------
# 7. Frontend Setup (CRITICAL FIX)
# -------------------------------
cd ../frontend

npm install

# 🔥 FORCE correct API base
cat <<EOT > .env
VITE_API_URL=
EOT

# 🔥 Clean old build (important)
rm -rf dist

npm run build

# -------------------------------
# 8. Deploy frontend
# -------------------------------
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# -------------------------------
# 9. Nginx Config (NO REWRITE)
# -------------------------------
sudo bash -c 'cat > /etc/nginx/sites-available/default' <<EOT
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
    }
}
EOT

sudo systemctl restart nginx

# -------------------------------
# DONE
# -------------------------------
echo "✅ Deployment Complete!"
echo "🌐 Open: http://$(curl -s ifconfig.me)"
echo "⚠️ If still /api/api issue → fix frontend fetch paths (remove extra /api)"
echo "⚠️ Run: pm2 startup → copy command → then pm2 save"
