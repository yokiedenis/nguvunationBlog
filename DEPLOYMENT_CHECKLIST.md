# Deployment Checklist - Event Video Solution

## Pre-Deployment Verification

### Backend Code

- [ ] All TypeScript/JavaScript files have correct syntax
- [ ] No console.error() statements indicate real issues
- [ ] All imports are properly resolved
- [ ] No deprecated function usage
- [ ] Environment variables documented

### Database

- [ ] MongoDB connection string configured
- [ ] Database credentials valid
- [ ] Collections created (Gallery, Event, User, etc.)
- [ ] Indexes created for performance
- [ ] Backup strategy in place

### External Services

- [ ] GCP bucket credentials configured
- [ ] GCP project access verified
- [ ] Bucket permissions set correctly
- [ ] Storage quotas verified
- [ ] JWT secret key configured

### API Testing

- [ ] Test user video upload endpoint
- [ ] Test event video upload endpoint
- [ ] Test event gallery retrieval
- [ ] Test analytics endpoint
- [ ] Test engagement endpoints (view, like)
- [ ] Test visibility controls
- [ ] Test permission enforcement
- [ ] Test error handling

### Security

- [ ] JWT validation working
- [ ] CORS configuration correct
- [ ] Authorization headers required
- [ ] Permission checks enforced
- [ ] SQL injection prevention (if applicable)
- [ ] File upload validation working

---

## Frontend Setup

### Components

- [ ] VideoUploadForm component created
- [ ] EventGallery component created
- [ ] EventVideoUpload component created
- [ ] EventAnalytics component created
- [ ] Video player component integrated
- [ ] Error handling UI added
- [ ] Loading states implemented

### Integration

- [ ] API endpoints correctly configured
- [ ] Authentication tokens properly sent
- [ ] Error messages displayed to users
- [ ] Success notifications implemented
- [ ] File upload drag-and-drop (optional)
- [ ] Progress indicators shown
- [ ] Responsive design verified

### Testing

- [ ] User can upload video
- [ ] Gallery displays correctly
- [ ] Likes/views working
- [ ] Analytics shows correct data
- [ ] Visibility controls respected
- [ ] Permission checks enforced
- [ ] Error handling works
- [ ] Mobile responsive

---

## Documentation

- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Code comments added
- [ ] Error codes documented
- [ ] Deployment guide written
- [ ] Troubleshooting guide created
- [ ] Frontend examples provided
- [ ] Backend examples provided

---

## Performance

- [ ] Database indexes created
- [ ] Query optimization verified
- [ ] GCP storage optimized
- [ ] API response times acceptable
- [ ] Pagination implemented for large galleries
- [ ] Caching strategy considered
- [ ] Load testing completed

---

## Monitoring

- [ ] Error logging configured
- [ ] Database query monitoring
- [ ] API response time tracking
- [ ] Storage usage monitoring
- [ ] User activity logging
- [ ] Event handler logging
- [ ] Alerts configured for failures

---

## Deployment Steps

### Step 1: Backup Database

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out ./backup
```

### Step 2: Install Dependencies

```bash
cd server
npm install
```

### Step 3: Configure Environment

```bash
# .env file should contain:
MONGODB_URI=mongodb+srv://...
JWT_SECRET_KEY=your_secret
GCP_PROJECT_ID=your_project
GCP_BUCKET_NAME=your_bucket
FRONTEND_CLIENT_URL=http://localhost:3000
```

### Step 4: Verify Database Connection

```bash
# Test connection
node -e "require('./utils/db_connect')().then(() => console.log('✅ Connected')).catch(e => console.log('❌ Failed:', e.message))"
```

### Step 5: Run Server

```bash
npm start
# Should see: "Server is running at PORT 5000"
# And: "Connection successful to database"
```

### Step 6: Test Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get all events
curl http://localhost:5000/events

# Get gallery
curl http://localhost:5000/videos/user/test-user
```

### Step 7: Deploy Frontend

```bash
cd client
npm run build
# Deploy dist folder to your hosting
```

### Step 8: Update Frontend Configuration

```javascript
// client/.env or config file
VITE_API_URL=https://api.yourdomain.com
VITE_VIDEO_API=https://api.yourdomain.com/videos
```

---

## Post-Deployment Verification

### Functional Testing

- [ ] User can upload videos
- [ ] Videos appear in gallery
- [ ] Event videos work correctly
- [ ] Analytics display properly
- [ ] Likes/views function
- [ ] Visibility controls work
- [ ] Permissions enforced
- [ ] File deletions work

### Performance Testing

- [ ] Large file uploads work
- [ ] Multiple concurrent uploads
- [ ] Gallery load times acceptable
- [ ] Analytics queries fast
- [ ] No memory leaks
- [ ] Database queries optimized

### Security Testing

- [ ] Unauthorized requests denied
- [ ] Private videos hidden properly
- [ ] Upload restrictions enforced
- [ ] CORS headers correct
- [ ] No sensitive data exposed
- [ ] File paths secure
- [ ] Tokens validated

### User Experience

- [ ] Error messages clear
- [ ] Loading indicators visible
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Intuitive navigation
- [ ] Fast feedback

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Server running without errors
- [ ] No unhandled exceptions
- [ ] Database connection stable
- [ ] API response times normal
- [ ] Storage usage within limits

### Weekly Checks

- [ ] Review error logs
- [ ] Check failed upload attempts
- [ ] Monitor database performance
- [ ] Verify backup completion
- [ ] Check user feedback

### Monthly Checks

- [ ] Database optimization
- [ ] Storage cleanup
- [ ] Performance analysis
- [ ] Security audit
- [ ] Cost review

---

## Rollback Plan

### If Critical Issue Found

#### Step 1: Stop Server

```bash
# Kill running process or use PM2
pm2 stop server
```

#### Step 2: Restore Previous Version

```bash
# If using git
git revert HEAD
npm install
npm start

# Or restore from backup
cp -r ./backup/original ./server
npm install
npm start
```

#### Step 3: Check Logs

```bash
# View error logs
tail -f server/logs/error.log
```

#### Step 4: Restore Database (if needed)

```bash
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## Configuration Checklist

### Environment Variables

```
✅ MONGODB_URI
✅ JWT_SECRET_KEY
✅ PORT (5000)
✅ FRONTEND_CLIENT_URL
✅ SESSION_SECRET_KEY
✅ GCP_PROJECT_ID
✅ GCP_BUCKET_NAME
✅ NODE_ENV (production)
```

### API Configuration

```
✅ CORS origin configured
✅ Session settings
✅ Request body size limits
✅ File upload limits
✅ Timeout settings
```

### Database Configuration

```
✅ MongoDB connection pooling
✅ Database indexes
✅ Backup schedule
✅ Retention policy
```

---

## Scaling Considerations

### If High Traffic Expected

1. **Database Optimization**
   - Add indexes on frequently queried fields
   - Consider read replicas
   - Implement caching layer (Redis)

2. **File Storage**
   - Use CDN for video delivery
   - Consider video compression
   - Implement smart caching

3. **API Scaling**
   - Load balancing (nginx)
   - Horizontal scaling
   - Rate limiting
   - Request queuing

4. **Media Processing**
   - Async video processing
   - Background jobs (Bull, RabbitMQ)
   - Thumbnail generation queue

---

## Disaster Recovery

### Data Loss Prevention

- [ ] Daily database backups
- [ ] Offsite backup storage
- [ ] Backup verification tests
- [ ] Disaster recovery plan documented
- [ ] Recovery time objective defined

### High Availability

- [ ] Database replication
- [ ] Server redundancy
- [ ] Load balancing
- [ ] Failover testing
- [ ] Incident response plan

---

## Sign-Off

| Item                    | Status | Date | Reviewer |
| ----------------------- | ------ | ---- | -------- |
| Code Review             | ⏳     |      |          |
| Security Audit          | ⏳     |      |          |
| Performance Testing     | ⏳     |      |          |
| User Acceptance Testing | ⏳     |      |          |
| Documentation Complete  | ⏳     |      |          |
| Deployment Approval     | ⏳     |      |          |

---

## Post-Deployment Communication

### Notify Team

- [ ] Notify developers of deployment
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Update documentation links
- [ ] Announce to users (if applicable)

### Monitor First 24 Hours

- [ ] Active error monitoring
- [ ] Performance tracking
- [ ] User feedback collection
- [ ] Support team ready
- [ ] Quick rollback capability

---

## Success Criteria

✅ All API endpoints responsive  
✅ Video uploads working  
✅ Gallery displays correctly  
✅ Analytics functional  
✅ No unhandled exceptions  
✅ Response times < 2 seconds  
✅ Database stable  
✅ File storage working  
✅ Permissions enforced  
✅ User feedback positive

---

## Troubleshooting During Deployment

### Issue: "Cannot connect to MongoDB"

```
Solution:
1. Verify MONGODB_URI is correct
2. Check network connectivity
3. Verify database credentials
4. Check IP whitelist in MongoDB Atlas
```

### Issue: "GCP bucket permission denied"

```
Solution:
1. Verify service account credentials
2. Check bucket IAM permissions
3. Verify GCP_PROJECT_ID and bucket name
4. Ensure credentials file is readable
```

### Issue: "JWT token invalid"

```
Solution:
1. Verify JWT_SECRET_KEY matches frontend
2. Check token expiration
3. Verify Authorization header format
4. Check token generation logic
```

### Issue: "CORS errors from frontend"

```
Solution:
1. Verify FRONTEND_CLIENT_URL matches frontend domain
2. Check CORS headers in server.js
3. Verify OPTIONS requests handled
4. Check browser console for detailed error
```

---

## Deployment Completed ✅

When all checks are complete and deployment successful:

1. Mark checkboxes above as completed
2. Update deployment date and reviewer
3. Archive this checklist
4. Store in deployment logs
5. Create post-mortems if issues found
6. Update runbook with lessons learned

---

**Deployment Checklist Version:** 1.0  
**Date Created:** January 30, 2026  
**Last Updated:** January 30, 2026  
**Status:** Ready for Deployment
