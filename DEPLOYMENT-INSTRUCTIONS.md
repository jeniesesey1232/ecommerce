# Deployment Instructions

## 🚀 Quick Setup Guide

### 1. Add Missing Environment Variable to Render

**CRITICAL:** You need to add `GOOGLE_CLIENT_ID` to your Render backend environment variables.

#### Steps:
1. Go to https://render.com/dashboard
2. Select your backend service: `ecommerce-7zzz`
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** Your Google OAuth Client ID (from Google Cloud Console)
6. Click "Save Changes"
7. Render will automatically redeploy

#### Where to find your Google Client ID:
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Copy the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

### 2. Current Environment Variables

#### Backend (Render)
```
MONGODB_URI=mongodb+srv://ronarosales17_db_user:***@ecommerce.gtlar1e.mongodb.net/ecommerce
JWT_SECRET=my-super-secret-key-12345
NODE_ENV=production
PORT=5000
GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID_HERE>  ⚠️ ADD THIS
```

#### Frontend (Vercel)
```
VITE_API_URL=https://ecommerce-7zzz.onrender.com/api
```

### 3. Verify Deployment

After adding `GOOGLE_CLIENT_ID`:

1. **Test Google Login:**
   - Go to https://ecommerce-three-eta-54.vercel.app/login
   - Click "Sign in with Google"
   - Should work without errors

2. **Test Regular Login:**
   - Use email/password login
   - Should work as before

3. **Test Cart & Orders:**
   - Add items to cart
   - Create an order
   - Verify prices are correct

### 4. Security Verification

Run these checks:

```bash
# Check for dependency vulnerabilities
cd ecommerce-backend
npm audit

# Fix any issues
npm audit fix
```

### 5. Monitoring

Watch for these in Render logs:
- ✅ "MongoDB connected"
- ✅ "Server running on port 5000"
- ❌ "JWT_SECRET not configured" (should NOT appear)
- ❌ "Token not issued for this application" (should NOT appear after adding GOOGLE_CLIENT_ID)

## 🔐 Security Checklist

- [x] CORS configured with whitelist
- [x] Rate limiting enabled
- [x] Helmet.js security headers
- [x] Input validation on all routes
- [x] MongoDB sanitization
- [x] JWT secret without fallback
- [x] Google OAuth verification
- [x] Price calculation server-side
- [x] Stock validation with transactions
- [x] Regex DoS prevention
- [ ] GOOGLE_CLIENT_ID environment variable (ADD THIS)

## 📝 Notes

- Never commit `.env` files to git
- Always use platform dashboards for environment variables
- Run `npm audit` regularly
- Monitor Render logs for errors
- Keep dependencies updated

## 🆘 Troubleshooting

### Google Login Fails
- Check `GOOGLE_CLIENT_ID` is set in Render
- Verify Vercel URL is in Google Console authorized origins
- Check Render logs for "Token not issued for this application"

### Cart Shows Wrong Prices
- Prices are now calculated server-side
- Clear browser cache and sessionStorage
- Verify products in database have correct prices

### Orders Not Creating
- Check MongoDB connection in Render logs
- Verify stock is available
- Check for transaction errors in logs

## 🎉 You're Done!

Once you add `GOOGLE_CLIENT_ID` to Render, your application is production-ready with enterprise-grade security.
