# 🚀 Quick Setup Guide

*Get your Employee Attendance System running in 5 minutes*

## ⚡ Express Setup (5 Minutes)

### Step 1: Admin Registration (1 min)
1. **Navigate to registration**: Go to `http://localhost:3000/register`
2. **Fill admin details**:
   - Full Name: Your name
   - Email: Your admin email
   - Password: Strong password
   - Admin Code: `ADMIN123` (default)
3. **Click "Register"** and wait for success message

### Step 2: First Login & Office Setup (2 min)
1. **Login**: Go to `/auth/signin` with your new credentials
2. **Set Office Location**:
   - Click "Set Office Location" button
   - Allow browser location access  
   - Confirm detected coordinates
   - Set radius: 100-500 meters (recommended: 200m)
   - Click "Save Location"

### Step 3: Create First Employee (1 min)
1. **Open Employee Management**: In admin dashboard
2. **Click "+ Add Employee"**
3. **Enter details**:
   - Name: Employee's full name
   - Email: Their work email
   - Password: Temporary password (they'll change it)
4. **Click "Add Employee"**

### Step 4: Test Employee Access (1 min)
1. **Share credentials** with employee
2. **Employee logs in** at `/auth/signin`
3. **Employee allows location** access
4. **Employee can now check in/out**

✅ **System is now ready for daily use!**

---

## 📋 Admin Daily Checklist

### Morning Setup (5 minutes)
- [ ] Check dashboard for overnight auto-checkouts
- [ ] Review who's currently checked in
- [ ] Monitor any location-related issues
- [ ] Verify system is responding properly

### During Day (As needed)
- [ ] Help employees with check-in problems
- [ ] Add new employees if hired
- [ ] Monitor real-time attendance stats
- [ ] Answer employee questions about the system

### End of Day (5 minutes)
- [ ] Review attendance summary
- [ ] Run manual cleanup if needed
- [ ] Generate reports for HR/payroll
- [ ] Check for any system alerts

---

## 👤 Employee Daily Workflow

### Arrival Routine
```
1. Open system on your device
2. Click "Check In" button
3. Wait for "✅ Check-in successful" message
4. Start your workday
```

### Departure Routine
```
1. Click "Check Out" button
2. Review your total hours
3. Wait for "✅ Check-out successful" message
4. Close system and leave
```

### Change Employee Password
```
Employee Dashboard → Profile Settings → Change Password 
→ Enter current password → Enter new password → Confirm → Update
```

### If Something Goes Wrong
- **Can't check in?** → Enable location, move closer to office
- **Already checked in?** → Check dashboard status
- **System error?** → Refresh page, contact admin

---

## 🔧 Quick Admin Actions

### Add New Employee
```
Admin Dashboard → Employee Management → + Add Employee 
→ Fill Name/Email/Password → Submit
```

### Check Employee Attendance
```
Admin Dashboard → Attendance Records 
→ Select date range → Filter by employee → View data
```

### Update Office Location
```
Admin Dashboard → Set Office Location 
→ Allow location access → Confirm coordinates → Save
```

### Fix Date Display Issues
```
Admin Dashboard → Date Format Settings 
→ Choose English/Nepali/Both → Select time format → Apply
```

### Change Admin Password
```
Admin Dashboard → Account Settings → Change Password 
→ Enter current password → Enter new password → Confirm → Update
```

---

## 🚨 Instant Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Employee can't check in | Check location enabled + within office radius |
| "Location verification failed" | Enable GPS, use WiFi, move closer to office |
| Wrong date showing | Check date format settings, refresh browser |
| Auto-checkout not working | Use Chrome/Safari, enable JavaScript |
| Admin panel not accessible | Verify admin role, clear cookies, re-login |
| Attendance hours wrong | Check timezone, verify check-in/out times |

---

## 📱 Mobile Quick Setup

### For Employees (Recommended)
1. **Open browser** (Chrome/Safari)
2. **Go to system URL**
3. **Add to Home Screen**:
   - iOS: Safari menu → "Add to Home Screen"
   - Android: Chrome menu → "Add to Home screen"
4. **Enable location** when prompted
5. **Use like a native app**

### Mobile Benefits
- ✅ Works offline for viewing history
- ✅ Push-like notifications
- ✅ Faster access than typing URL
- ✅ Full functionality on mobile

---

## ⚙️ Essential Configuration

### Environment Variables (Required)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/attendance"

# Authentication  
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string"

# Admin Registration
ADMIN_REGISTRATION_CODE="ADMIN123"  # Change this!

# Auto-checkout API
CRON_API_KEY="your-cron-secret-key"
```

### First-Time Database Setup
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Production Checklist
- [ ] Change `ADMIN_REGISTRATION_CODE` from default
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure production database
- [ ] Set up automated backups
- [ ] Enable error monitoring

---

## 🎯 Success Indicators

### System is Working When:
- ✅ Admin can register and login
- ✅ Office location is set and accurate
- ✅ Employees can check in within radius
- ✅ Dashboard shows real-time statistics
- ✅ Auto-checkout works on browser close
- ✅ Date formats display correctly

### Common Success Messages:
```
✅ "Check-in successful at 9:15 AM"
✅ "Check-out successful at 6:00 PM"  
✅ "Employee added successfully"
✅ "Office location updated successfully"
✅ "Auto checkout completed - browser_close"
```

---

## 🔄 Quick System Test

### 5-Minute Functionality Test
1. **Admin Test**: Login → Add dummy employee → Set location
2. **Employee Test**: Login as employee → Check in → Check dashboard
3. **Auto-checkout Test**: Close browser → Reopen → Verify auto-checkout
4. **Mobile Test**: Open on phone → Check responsive design
5. **Date Test**: Toggle date formats → Verify changes apply

### If Test Fails:
- Check browser console for errors
- Verify database connection
- Confirm environment variables
- Test internet connectivity
- Review error logs

---

## 📞 Getting Help

### Self-Service First:
1. **Check error messages** - they're usually specific
2. **Refresh browser** - clears temporary issues
3. **Clear browser cache** - fixes caching problems
4. **Try different browser** - rules out browser issues
5. **Check internet connection** - ensures API access

### When to Escalate:
- Database connection errors
- Authentication system failures
- Geolocation API not working
- Multiple employees reporting same issue
- Data corruption or loss

### Quick Debug Commands:
```bash
# Check if system is running
curl http://localhost:3000/api/health

# Test database connection
npx prisma db status

# View recent logs
npm run logs

# Check environment variables
npm run env:check
```

---

## 🎉 Pro Tips

### For Smooth Operation:
1. **Set realistic office radius** (200m works well)
2. **Train employees on first day** - show them once
3. **Use consistent devices** - same computer/phone daily
4. **Enable auto-startup** - system starts with computer
5. **Regular backups** - daily database exports

### Optimization Tricks:
- **Bookmark login page** for quick access
- **Use browser "Remember me"** for convenience
- **Add to desktop/dock** for visibility
- **Set up email alerts** for system issues
- **Create user documentation** specific to your office

---

## 📊 Quick Stats to Monitor

### Daily Metrics:
- **Total Employees**: How many active users
- **Check-in Rate**: % of employees who checked in today
- **Average Hours**: Normal working time per employee
- **Auto-checkouts**: How many automated vs manual

### Weekly Review:
- **Attendance Patterns**: Who's consistently late/early
- **System Usage**: Are employees using it correctly
- **Error Frequency**: Common problems to address
- **Feature Adoption**: Which features are popular

---

*🚀 Your attendance system is now ready! Start with the 5-minute setup and expand as needed.*

**Next Steps**: Read the full README.md for advanced features and Employee Manual for user training.
