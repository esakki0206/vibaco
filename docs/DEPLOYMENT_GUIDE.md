# Deployment Guide

This guide covers deploying the Saree E-Commerce Platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Nginx Configuration](#nginx-configuration)
- [SSL Certificate](#ssl-certificate)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Server Requirements:**
   - Ubuntu 20.04+ or similar Linux distribution
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB+ disk space
   - Node.js 18+ installed
   - MongoDB 6.0+ (local or Atlas)
   - Nginx web server
   - Git

2. **Domain Name:**
   - Registered domain (e.g., sareestore.com)
   - DNS configured to point to your server IP

3. **Services & Accounts:**
   - MongoDB Atlas account (for cloud database)
   - Razorpay account (for payments)
   - PM2 process manager (recommended)

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saree-prod
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=https://sareestore.com
ADMIN_EMAIL=admin@sareestore.com
```

**Important:**
- Generate a secure JWT secret: `openssl rand -base64 32`
- Use strong passwords for MongoDB
- Never commit `.env` files to Git

### Frontend Environment Variables

Create `.env` file in `frontend/`:

```env
VITE_API_URL=https://api.sareestore.com/api
VITE_APP_NAME=Saree Store
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create a free tier account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your server IP address (or use 0.0.0.0/0 for all IPs)
5. Get the connection string and update `MONGODB_URI` in backend `.env`

### Option 2: Self-Hosted MongoDB

1. Install MongoDB on your server:
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

2. Configure authentication in `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

3. Restart MongoDB:
```bash
sudo systemctl restart mongodb
```

4. Create admin user:
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})
```

5. Update `MONGODB_URI` in backend `.env`:
```
mongodb://username:password@localhost:27017/saree-prod
```

## Backend Deployment

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/yourusername/SareeWeb.git
cd SareeWeb/backend
```

### 2. Install Dependencies

```bash
npm ci --only=production
```

### 3. Build and Start with PM2

Install PM2 globally:
```bash
sudo npm install -g pm2
```

Create PM2 ecosystem file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'saree-backend',
    script: './src/server.js',
    cwd: '/var/www/SareeWeb/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Verify Backend

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Deployment

### 1. Build for Production

```bash
cd /var/www/SareeWeb/frontend
npm ci
npm run build
```

The build output will be in `dist/` directory.

### 2. Serve with PM2

Create `ecosystem.config.js` in frontend directory:
```javascript
module.exports = {
  apps: [{
    name: 'saree-frontend',
    script: 'serve',
    args: '-s dist -l 3000',
    cwd: '/var/www/SareeWeb/frontend',
    autorestart: true,
    watch: false
  }]
}
```

Install serve:
```bash
sudo npm install -g serve
```

Start frontend:
```bash
cd /var/www/SareeWeb/frontend
pm2 start ecosystem.config.js
pm2 save
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### 2. Configure Nginx

Copy the provided configuration:

```bash
sudo cp /var/www/SareeWeb/nginx/saree-shop.conf /etc/nginx/sites-available/saree-shop
sudo ln -s /etc/nginx/sites-available/saree-shop /etc/nginx/sites-enabled/
```

Edit the configuration to match your domain:

```nginx
# /etc/nginx/sites-available/saree-shop.conf

server {
    listen 80;
    server_name sareestore.com www.sareestore.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload size limit
    client_max_body_size 10M;
}
```

### 3. Test and Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. Allow HTTP Traffic

```bash
sudo ufw allow 'Nginx Full'
```

## SSL Certificate

### Using Let's Encrypt (Free)

1. Install Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

2. Obtain Certificate:
```bash
sudo certbot --nginx -d sareestore.com -d www.sareestore.com
```

3. Certbot will automatically configure SSL in your Nginx config.

### Auto-Renewal

Certbot sets up automatic renewal. Verify with:
```bash
sudo certbot renew --dry-run
```

## Monitoring & Logging

### PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs saree-backend
pm2 logs saree-frontend

# Monitor in real-time
pm2 monit

# Restart
pm2 restart saree-backend
pm2 restart saree-frontend
```

### Nginx Access Logs

```bash
tail -f /var/log/nginx/access.log
```

### Nginx Error Logs

```bash
tail -f /var/log/nginx/error.log
```

### Application Logs

Backend logs with PM2:
```bash
pm2 logs saree-backend --lines 100
```

## Updates & Maintenance

### Update Backend

```bash
cd /var/www/SareeWeb/backend
git pull origin main
npm ci --only=production
pm2 restart saree-backend
```

### Update Frontend

```bash
cd /var/www/SareeWeb/frontend
git pull origin main
npm ci
npm run build
pm2 restart saree-frontend
```

### Database Backups (MongoDB Atlas)

MongoDB Atlas provides automatic backups for paid tiers.
For free tier, set up manual backups:

```bash
mongodump --uri="mongodb://username:password@host:port/dbname" --out=/backup/path
```

Set up cron job for automated backups:
```bash
crontab -e
# Add: 0 2 * * * mongodump --uri="..." --out=/backup/path
```

## Security Best Practices

1. **Firewall:**
   - Only allow necessary ports (80, 443, 22)
   - Use SSH key authentication
   - Disable root login

2. **Application Security:**
   - Keep dependencies updated: `npm audit fix`
   - Use environment variables for all secrets
   - Enable CORS only for trusted domains
   - Implement rate limiting on API endpoints

3. **Database Security:**
   - Use strong passwords
   - Enable authentication
   - Network whitelist only necessary IPs
   - Regular backups

## Troubleshooting

### Backend Not Starting

Check logs:
```bash
pm2 logs saree-backend
```

Common issues:
- MongoDB connection: Check `MONGODB_URI` and network access
- Port already in use: `lsof -i :5000`
- Missing dependencies: Run `npm ci`

### Frontend Not Loading

Check if build directory exists:
```bash
ls -la /var/www/SareeWeb/frontend/dist
```

Rebuild if needed:
```bash
npm run build
```

### Nginx 502 Bad Gateway

Check if backend is running:
```bash
pm2 status
curl http://localhost:5000/health
```

Check Nginx error logs:
```bash
tail -f /var/log/nginx/error.log
```

### Database Connection Issues

Test MongoDB connection:
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/saree-prod"
```

Check Atlas dashboard for connection status and IP whitelist.

## Scaling Considerations

### Horizontal Scaling

- Use a load balancer (Nginx or AWS ALB)
- Deploy multiple backend instances
- Use a shared MongoDB instance

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching (Redis)

### CDN for Static Assets

- Use CloudFront or Cloudflare
- Serve images, CSS, JS from CDN
- Reduce server load

## Backup Strategy

1. **Code:**
   - Git repository
   - Regular commits to main branch

2. **Database:**
   - MongoDB Atlas automatic backups (paid)
   - Manual backups for free tier

3. **Configuration:**
   - Store environment variables securely
   - Document all configuration changes

## Support

For issues or questions:
- Check logs first
- Review API documentation
- Check MongoDB Atlas status
- Contact hosting provider if server issues
