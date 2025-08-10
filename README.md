# Employee Attendance System

A comprehensive web-based attendance management system built with Next.js, featuring role-based access control, geolocation verification, auto-checkout functionality, and support for both English and Nepali date formats.

## 🚀 Features

- **Role-Based Access Control**: Separate interfaces for Admin and Employee users
- **Geolocation Verification**: Employees must be within office premises to check in/out
- **Auto-Checkout**: Automatic checkout on browser close or inactivity
- **Dual Calendar Support**: English (Gregorian) and Nepali (Bikram Sambat) calendars
- **Real-time Monitoring**: Live attendance tracking and dashboard updates
- **Comprehensive Reporting**: Detailed attendance records and analytics

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [User Roles](#user-roles)
- [Admin Guide](#admin-guide)
- [Employee Guide](#employee-guide)
- [System Workflow](#system-workflow)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd employee-attendance-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Admin Registration
ADMIN_REGISTRATION_CODE="ADMIN123"

# Auto-checkout
CRON_API_KEY="your-cron-api-key"
```

## 👥 User Roles

### 🔐 Admin
- **Full System Access**: Manage all aspects of the attendance system
- **Employee Management**: Add, view, and remove employees
- **System Configuration**: Set office location, manage settings
- **Reporting & Analytics**: View comprehensive attendance reports
- **User Administration**: Manage user accounts and permissions

### 👤 Employee
- **Attendance Tracking**: Check in and check out daily
- **Personal Dashboard**: View own attendance history and statistics
- **Profile Management**: Update personal information
- **Real-time Status**: See current check-in status and working hours

---

## 🛠️ Admin Guide

### Initial Setup

#### 1. **Admin Registration**
- Navigate to `/register` or `/admin/register`
- Fill in admin details:
  - Full Name
  - Email Address
  - Secure Password
  - Admin Registration Code (default: `ADMIN123`)
- Click "Register" to create admin account

#### 2. **Office Location Setup**
After logging in, set up the office location for geolocation verification:
- Go to Admin Dashboard
- Click "Set Office Location" button
- Allow browser location access
- Confirm the detected location
- Set check-in radius (recommended: 100-500 meters)

#### 3. **Date Format Configuration**
Configure date display preferences:
- Access "Date Format Settings" in the admin dashboard
- Choose from:
  - **English**: Standard Gregorian calendar
  - **Nepali**: Bikram Sambat calendar
  - **Both**: Display both formats
- Set time format (12-hour or 24-hour)

### Daily Admin Operations

#### **Employee Management**
- **Add New Employees**:
  - Navigate to "Employee Management" section
  - Click "+ Add Employee"
  - Fill in employee details:
    - Full Name
    - Email Address
    - Initial Password
  - Employee receives login credentials to start using the system

- **View Employee List**:
  - See all employees in a table format
  - View employee details: Name, Email, Role, Date Added
  - Monitor employee status and activity

- **Remove Employees**:
  - Click delete button next to employee name
  - Confirm deletion in the dialog
  - All associated attendance records are also removed

#### **Attendance Monitoring**
- **Real-time Dashboard**:
  - Total Employees count
  - Today's Total Hours worked
  - Current Attendance Rate
  - Currently Checked-in Employees

- **Attendance Records**:
  - View comprehensive attendance table
  - Filter by employee and date range
  - Export reports for payroll and HR purposes
  - See check-in/out times, total hours, and status

#### **System Administration**
- **Office Location Management**:
  - Update office location if business moves
  - Adjust check-in radius for flexibility
  - Monitor location-based check-in attempts

- **Auto-Checkout Management**:
  - End-of-day cleanup for forgotten checkouts
  - Monitor auto-checkout events
  - Configure inactivity timeouts

### Admin Dashboard Features

```
📊 Dashboard Overview
├── 📈 Statistics Cards
│   ├── Total Employees
│   ├── Today's Hours
│   ├── Attendance Rate
│   └── Currently In Office
├── 🏢 Quick Actions
│   ├── Set Office Location
│   └── Date Format Settings
├── 👥 Employee Management
│   ├── Add New Employee
│   ├── View Employee List
│   └── Delete Employees
└── 📋 Attendance Records
    ├── Filter by Date Range
    ├── Filter by Employee
    └── Export Reports
```

---

## 👤 Employee Guide

### Getting Started

#### 1. **Receiving Access**
- Admin creates your account and provides:
  - Email address (your login username)
  - Temporary password
  - System URL

#### 2. **First Login**
- Navigate to `/auth/signin`
- Enter your email and password
- Update password if needed
- Access your employee dashboard

#### 3. **Initial Setup**
- Allow browser location access for check-in functionality
- Familiarize yourself with the dashboard layout
- Review your profile information

### Daily Operations

#### **Checking In**
1. **Arrive at Office**:
   - Ensure you're within office premises
   - Open the attendance system
   - Navigate to your dashboard

2. **Perform Check-in**:
   - Click the "Check In" button
   - System verifies your location
   - Confirmation message appears
   - Check-in time is recorded

3. **Check-in Requirements**:
   - ✅ Must be within office radius
   - ✅ Browser location access enabled
   - ✅ Internet connection active
   - ✅ Not already checked in for the day

#### **Checking Out**
1. **Manual Check-out**:
   - Click "Check Out" button before leaving
   - System calculates total working hours
   - Check-out time is recorded

2. **Automatic Check-out**:
   - System automatically checks you out if:
     - Browser window is closed
     - Extended inactivity (30+ minutes)
     - End of day cleanup (6 PM default)

#### **Monitoring Your Attendance**
- **Dashboard Overview**:
  - Current status (Checked In/Out)
  - Today's working hours
  - Check-in/out times
  - Live timer when checked in

- **Attendance History**:
  - View past attendance records
  - Filter by date range
  - See total hours per day
  - Monitor attendance patterns

### Employee Dashboard Features

```
👤 Employee Dashboard
├── ⏰ Current Status
│   ├── Check In/Out Buttons
│   ├── Live Working Timer
│   └── Today's Hours
├── 📊 Quick Stats
│   ├── Today's Status
│   ├── This Week's Hours
│   └── Monthly Summary
├── 📋 Recent Attendance
│   ├── Last 7 Days
│   ├── Status Indicators
│   └── Hours Breakdown
└── ⚙️ Settings
    ├── Date Format Preference
    ├── Time Format (12h/24h)
    └── Profile Information
```

---

## 🔄 System Workflow

### Registration & Setup Flow
```mermaid
graph TD
    A[Admin Registers] --> B[Admin Logs In]
    B --> C[Set Office Location]
    C --> D[Configure Date Settings]
    D --> E[Add Employees]
    E --> F[Employees Receive Credentials]
    F --> G[System Ready for Use]
```

### Daily Attendance Flow
```mermaid
graph TD
    A[Employee Arrives at Office] --> B[Opens System]
    B --> C[Clicks Check In]
    C --> D{Location Verified?}
    D -->|Yes| E[Check In Successful]
    D -->|No| F[Location Error]
    E --> G[Work Throughout Day]
    G --> H[Ready to Leave]
    H --> I[Clicks Check Out]
    I --> J[Check Out Successful]
    
    G --> K{Browser Closed?}
    K -->|Yes| L[Auto Check Out]
    G --> M{Inactive 30+ min?}
    M -->|Yes| L
```

### Auto-Checkout Scenarios
```mermaid
graph TD
    A[Employee Checked In] --> B{Activity Monitoring}
    B --> C[Browser Close Detected]
    B --> D[30 Min Inactivity]
    B --> E[End of Day 6PM]
    C --> F[Auto Checkout]
    D --> F
    E --> F
    F --> G[Calculate Hours]
    G --> H[Update Database]
```

---

## ⚙️ Configuration

### Office Location Settings
- **Radius**: 100-500 meters recommended
- **Coordinates**: Automatically detected or manually set
- **Accuracy**: GPS accuracy affects check-in success

### Date Format Options
- **English**: Aug 10, 2025 | 2:30 PM
- **Nepali**: श्रावण २५, २०८२ | १४:३०
- **Both**: श्रावण २५, २०८२ (Aug 10, 2025)

### Auto-Checkout Settings
- **Inactivity Timeout**: 30 minutes (configurable)
- **End of Day**: 6:00 PM (configurable)
- **Browser Close**: Immediate (automatic)

---

## 🔌 API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Attendance Endpoints
- `GET /api/attendance/status` - Get current status
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance/auto-checkout` - Auto checkout
- `GET /api/attendance` - Get attendance records

### Admin Endpoints
- `GET /api/admin/employees` - List employees
- `POST /api/admin/employees` - Add employee
- `DELETE /api/admin/employees` - Remove employee

### System Endpoints
- `GET /api/office-location` - Get office location
- `POST /api/office-location` - Set office location

---

## 🔧 Troubleshooting

### Common Issues

#### **Check-in Problems**
**Issue**: "Location verification failed"
- ✅ Enable browser location access
- ✅ Ensure GPS is active
- ✅ Move closer to office location
- ✅ Check internet connection

**Issue**: "Already checked in today"
- ✅ Verify you haven't already checked in
- ✅ Check dashboard status
- ✅ Contact admin if data is incorrect

#### **Auto-Checkout Issues**
**Issue**: Not automatically checking out
- ✅ Ensure browser supports beforeunload events
- ✅ Check if ad blockers are interfering
- ✅ Verify internet connection during exit

#### **Date Display Problems**
**Issue**: Wrong date showing
- ✅ Check date format settings
- ✅ Verify system timezone
- ✅ Refresh browser cache

#### **Admin Access Issues**
**Issue**: Cannot access admin panel
- ✅ Verify admin role in database
- ✅ Check session authentication
- ✅ Re-login if necessary

### Support & Maintenance

#### **Database Cleanup**
```bash
# End-of-day auto checkout
curl -X POST http://localhost:3000/api/attendance/cleanup \
  -H "Authorization: Bearer your-cron-api-key"
```

#### **System Health Checks**
- Monitor database connections
- Check API response times
- Verify geolocation services
- Review error logs

---

## 📈 Best Practices

### For Admins
- 🔒 **Security**: Change default admin code in production
- 📍 **Location**: Set appropriate office radius (not too strict/loose)
- ⏰ **Monitoring**: Review attendance daily for anomalies
- 🔄 **Backups**: Regular database backups
- 📊 **Reports**: Generate weekly/monthly reports

### For Employees
- 📱 **Device**: Use consistent device for attendance
- 🌐 **Browser**: Enable location services
- ⏰ **Timing**: Check in promptly upon arrival
- 🔄 **Logout**: Properly check out before leaving
- 📞 **Issues**: Report problems immediately to admin

### For System Maintenance
- 🔧 **Updates**: Keep dependencies updated
- 📊 **Monitoring**: Set up logging and monitoring
- 🔐 **Security**: Regular security audits
- 📦 **Backups**: Automated daily backups
- 🔄 **Testing**: Test all features regularly

---

## 📚 Additional Resources

- **Prisma Documentation**: [https://prisma.io/docs](https://prisma.io/docs)
- **NextAuth.js Guide**: [https://next-auth.js.org](https://next-auth.js.org)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Geolocation API**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

## 🤝 Support

For technical support or feature requests:
1. Check the troubleshooting section
2. Review system logs for errors
3. Contact system administrator
4. Report issues with detailed descriptions

---

*Built with ❤️ using Next.js, Prisma, and modern web technologies*
