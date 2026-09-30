# প্রোডাকশন ডিপ্লয়মেন্ট নির্দেশিকা (DEPLOYMENT.md)

**পোল্ট্রি ফার্ম ম্যানেজার** একটি সিঙ্গেল-টেন্যান্ট (Single-Tenant) আর্কিটেকচারের উপর ভিত্তি করে তৈরি। প্রতিটি নতুন খামার ক্লায়েন্টের জন্য একটি পৃথক ডাটাবেস এবং পৃথক ডিপ্লয়মেন্ট ইনস্ট্যান্স তৈরি করা হয়।

---

## ডিপ্লয়মেন্ট অপশনসমূহ

### অপশন ১: Vercel এ ডিপ্লয়মেন্ট (প্রস্তাবিত ও দ্রুততম)

1. **গিট রিপোজিটরি প্রস্তুত করুন**:
   - কোড গিটহাবে পুশ করুন (প্রাইভেট রিপোজিটরি হিসেবে)।

2. **Vercel এ প্রজেক্ট ইমপোর্ট করুন**:
   - [Vercel Dashboard](https://vercel.com/) এ গিয়ে **Add New Project** ক্লিক করুন।
   - রিপোজিটরি নির্বাচন করুন।
   - Framework Preset: **Next.js** সিলেক্ট থাকবে।

3. **এনভায়রনমেন্ট ভেরিয়েবল সেট করুন**:
   প্রজেক্ট সেটিংসে গিয়ে নিচের ভেরিয়েবলগুলো পূরণ করুন:
   ```env
   APP_URL=https://clientfarm.vercel.app
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/client_farm_db?retryWrites=true&w=majority
   
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=client-farm.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=client-farm
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=client-farm.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   
   FIREBASE_PROJECT_ID=client-farm
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@client-farm.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=client-cloud
   CLOUDINARY_CLOUD_NAME=client-cloud
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=your_secret_here
   
   INITIAL_OWNER_EMAIL=owner@clientfarm.com
   INITIAL_OWNER_SECRET_KEY=secure_key_here
   ```

4. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে অ্যাপ্লিকেশন লাইভ হয়ে যাবে।

---

### অপশন ২: লিনাক্স / উবুন্টু VPS সার্ভার (Ubuntu 22.04 LTS) এ ডিপ্লয়মেন্ট

1. **সার্ভার প্যাকেজ আপডেট ও Node.js ইনস্টল**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs nginx git
   sudo npm install -g pm2
   ```

2. **প্রজেক্ট ক্লোন ও ডিপেনডেন্সি ইনস্টল**:
   ```bash
   cd /var/www
   git clone <repo-url> poultry-farm
   cd poultry-farm
   npm install --legacy-peer-deps
   cp .env.example .env.local
   nano .env.local # ক্লায়েন্টের ক্রেডেনশিয়াল পূরণ করুন
   ```

3. **বিল্ড ও PM2 দিয়ে চালু**:
   ```bash
   npm run build
   pm2 start npm --name "poultry-farm" -- start
   pm2 startup
   pm2 save
   ```

4. **Nginx রিভার্স প্রক্সি কনফিগারেশন**:
   `/etc/nginx/sites-available/poultry-farm` ফাইলে:
   ```nginx
   server {
       listen 80;
       server_name farm.clientdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   সক্ষম করুন ও Nginx রিস্টার্ট করুন:
   ```bash
   sudo ln -s /etc/nginx/sites-available/poultry-farm /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **SSL সার্টিফিকেট (Certbot)**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d farm.clientdomain.com
   ```

---

## ক্লাউড সার্ভিসসমূহ সেটআপ নির্দেশিকা

### ১. MongoDB Atlas (ডাটাবেস)
1. [MongoDB Atlas](https://cloud.mongodb.com/) এ লগইন করুন।
2. ক্লায়েন্টের নামে ডেডিকেটেড ডাটাবেস তৈরি করুন (যেমন: `client_agro_db`)।
3. **Database Access** এ গিয়ে রিড-রাইট ব্যবহারকারী তৈরি করুন।
4. **Network Access** এ গিয়ে সার্ভার বা Vercel আইপি এলাও করুন (`0.0.0.0/0` বা নির্দিষ্ট আইপি)।
5. কানেকশন স্ট্রিং সংগ্রহ করে `MONGODB_URI` তে বসান।

### ২. Firebase Authentication (লগইন সিস্টেম)
1. [Firebase Console](https://console.firebase.google.com/) এ গিয়ে প্রজেক্ট খুলুন।
2. **Build > Authentication** এ গিয়ে **Google** সাইন-ইন মেথড এনেবল করুন।
3. **Authorized Domains** এ খামারের ডোমেইন (যেমন: `clientfarm.vercel.app`) যোগ করুন।
4. **Project Settings > Service Accounts** এ গিয়ে **Generate new private key** ক্লিক করে JSON ফাইলটি ডাউনলোড করুন এবং `FIREBASE_CLIENT_EMAIL` ও `FIREBASE_PRIVATE_KEY` ভেরিয়েবলে বসান।

### ৩. Cloudinary (ছবি ও ভাউচার রসিদ)
1. [Cloudinary Console](https://cloudinary.com/) এ ক্লায়েন্টের অ্যাকাউন্ট খুলুন।
2. Dashboard থেকে `Cloud Name`, `API Key`, এবং `API Secret` সংগ্রহ করে এনভায়রনমেন্ট ভেরিয়েবলে দিন।
