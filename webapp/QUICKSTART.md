# ⚡ QUICKSTART GUIDE

Get LearnHub running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need v18+)
node --version

# Check MySQL (need v8+)
mysql --version

# Check npm
npm --version
```

## 🚀 Fast Setup (3 Steps)

### Step 1: Database Setup (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Run these commands in MySQL:
CREATE DATABASE lecture_platform;
USE lecture_platform;
SOURCE /home/user/webapp/schema.sql;
SOURCE /home/user/webapp/seed.sql;
exit;
```

### Step 2: Backend Setup (1 minute)

```bash
cd /home/user/webapp/backend

# Create .env file
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=lecture_platform
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF

# IMPORTANT: Edit the DB_PASSWORD in .env file
nano .env

# Start backend with PM2
pm2 start ecosystem.config.cjs

# Check if running
pm2 list
pm2 logs backend-api --nostream
```

### Step 3: Frontend Setup (1 minute)

```bash
# Open new terminal
cd /home/user/webapp/frontend

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm run dev
```

## 🎯 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🔐 Login Credentials

### Admin Account
```
Email: admin@example.com
Password: admin123
```

### Student Accounts
```
Email: john@example.com
Password: admin123

Email: jane@example.com
Password: admin123

Email: mike@example.com
Password: admin123
```

## ✅ What to Test

1. **Register:** Go to http://localhost:3000/auth/register and create a new account
2. **Login:** Test login at http://localhost:3000/auth/login
3. **Student Dashboard:** View enrolled courses and progress
4. **Admin Panel:** Login as admin and manage courses
5. **Responsive:** Test on mobile/tablet/desktop sizes

## 🔧 Common Issues

### Port Already in Use

```bash
# Kill port 5000 (backend)
fuser -k 5000/tcp

# Kill port 3000 (frontend)
fuser -k 3000/tcp

# Restart services
pm2 restart backend-api
cd /home/user/webapp/frontend && npm run dev
```

### Database Connection Error

```bash
# Check MySQL is running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### PM2 Not Found

```bash
# PM2 is pre-installed in sandbox, but if needed:
npm install -g pm2
```

## 📊 Verify Setup

```bash
# Check backend is running
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"Server is running","timestamp":"..."}

# Check PM2 status
pm2 status

# View backend logs
pm2 logs backend-api --lines 50
```

## 🎉 You're Ready!

Everything should now be running. Visit:
- **Homepage:** http://localhost:3000
- **Login:** http://localhost:3000/auth/login
- **Dashboard:** http://localhost:3000/dashboard (after login)

---

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. View logs: `pm2 logs backend-api`
3. Check database: `mysql -u root -p lecture_platform`
4. Restart everything:
   ```bash
   pm2 restart backend-api
   # In another terminal:
   cd /home/user/webapp/frontend && npm run dev
   ```

---

**Happy Learning! 🎓**
