base template code comes from https://github.com/pawantech12 or https://www.linkedin.com/in/pawan-kumavat-11b105297/
        
events videos microservices template code comes from https://github.com/NemroNeno/CloudProject.git

for copyrights issues please reachout to me for takedown 
this codebase is free to use
             
 # how to set up environment
            .git clone repo in desired folder
            2.navigate to client and server [cd client and cd server]
            3.npm instal for both.
            4.add .env file variables
            5.npm run dev to serve locally [port 5000, port (http://localhost:5173)]
            6.host on vercel for session render for cookies, NB render has no session. 
            7.rapid fire using the auto deployment of vercel in the production site for agile dev with ai give full code prompt (good for typescript bug detection) then copy failure logs and paste in deepseek with associated code, building without learning


currently transforming microservices to Monolithic architecture 
2.security
3.speed.perfOrmance
4.SEo
5.crisp graphics

tech stack
 # Frontend Framework:
React.Vite 
Tailwind CSS
firebase <3asy login[google, twitter, facebook]
Context API 
state management


 # BACKEND
RESTful API
MongoDB[Models.NoSQL]
Cloudinary
Asynchronous Node.js 
async/await Express.js 
GCP cloud storage

            Database Configuration
            MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

            Server Configuration
            PORT=5000

            Authentication Keys
            JWT_SECRET_KEY="your_jwt_secret_key_here"
            SESSION_SECRET_KEY="your_session_secret_key_here"

            Cloudinary Configuration
            CLOUDINARY_CLOUD_NAME=your_cloud_name
            CLOUDINARY_API_KEY=your_api_key
            CLOUDINARY_API_SECRET=your_api_secret

            Email SMTP Configuration
            SMTP_HOST=smtp.example.com
            SMTP_PORT=587
            SMTP_USER=your_email@example.com
            SMTP_PASS=your_email_password_or_app_specific_password

            Firebase Configuration
            FIREBASE_PROJECT_ID=your_firebase_project_id
            FIREBASE_PRIVATE_KEY_ID=your_private_key_id
            FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<your_private_key_here>\n-----END PRIVATE KEY-----\n"
            FIREBASE_CLIENT_EMAIL=your_firebase_client_email
            FIREBASE_CLIENT_ID=your_client_id
            FRONTEND_CLIENT_URL=http://localhost:5173

            Environment
            NODE_ENV=local

            GCP Configuration
            GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
            GCP_BUCKET_NAME=your_bucket_name

            Service URLs
            EVENT_SERV=http://example.com
            AUTH_SERV=http://example.com/users
            STORAGE_SERV=http://example.com/storage
            GALLERY_SERV=http://example.com/videos
            LOG_SERV=http://example.com/logs
            USAGE_SERV=http://example.com/usagemonitoring
            QUERY_SERV=http://example.com/queries



 # FRONTEND
            Firebase Configuration (Client-side)
            VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
            VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
            VITE_FIREBASE_PROJECT_ID="your-project-id"
            VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
            VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
            VITE_FIREBASE_APP_ID="1:123456789012:web:abc123def456"
            VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

            Server URL
            VITE_SERVER_URL="http://localhost:5000"


WEB APP UNDER DEVELOPMENT BY yokas[fullstack], milqan[logo redesign], custer'ed[frontend], rukundo rolex[ui/ux.graphics]