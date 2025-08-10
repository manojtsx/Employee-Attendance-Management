# Admin Registration Environment Variables

## Required Environment Variables

Add the following environment variables to your `.env` or `.env.local` file:

```bash
# Admin Registration Code
# This code is required when registering a new admin user
# Change this to a secure value in production
ADMIN_REGISTRATION_CODE=ADMIN123

# Auto-Checkout Configuration
# API key for cron job to perform end-of-day cleanup
CRON_API_KEY=your-secret-cron-key

# Database URL (if not already set)
DATABASE_URL="your-database-connection-string"
```

## Usage

1. **Admin Registration**: When users select "Admin" role during registration, they will be required to enter the admin registration code.

2. **Security**: Make sure to:
   - Use a strong, unique code in production
   - Keep this code secret and only share with authorized personnel
   - Consider rotating this code periodically

3. **Example Production Code**:
   ```bash
   ADMIN_REGISTRATION_CODE=SecureAdminCode2024!
   ```

## Registration Flow

1. Users can access the registration page at `/register`
2. They fill out the form with their details
3. If they select "Admin" role, they must provide the admin registration code
4. After successful registration, they can sign in at `/auth/signin`

## Admin Features

Once registered as an admin, users can:
- Access the admin dashboard at `/admin`
- View all employees and attendance records
- Add new employees
- Manage office locations
- Update user roles
- Delete users (except their own account)
- View dashboard statistics
- **Configure date format preferences (English/Nepali/Both)**

## Nepali Date System Integration

The application now supports Nepali calendar system (Bikram Sambat) alongside the English calendar:

### Date Format Options:
- **English Calendar**: Standard Gregorian calendar (e.g., "Aug 10, 2025")
- **Nepali Calendar**: Bikram Sambat calendar (e.g., "Shrawan 25, 2082")
- **Both**: Displays both formats (e.g., "Shrawan 25, 2082 (Aug 10, 2025)")

### Features:
- **Universal Date Picker**: Automatically switches between English and Nepali date inputs based on user preference
- **Real-time Format Switching**: Change date format preference and see updates immediately
- **Consistent Display**: All dates throughout the application use the selected format
- **Fallback Support**: Gracefully falls back to English format if Nepali conversion fails

### Components with Nepali Date Support:
- Attendance tables and records
- User management created dates
- Dashboard current time display
- Date range filters
- All timestamp displays

### Settings:
Access date format settings in the admin dashboard to:
- Switch between English, Nepali, or both formats
- Change time format (12h/24h)
- Preview format changes in real-time

## Auto-Checkout Features

The system now includes automatic checkout functionality:

### For Employees:
- **Browser Close Detection**: Automatically checks out when browser is closed/refreshed
- **Inactivity Timeout**: Auto checkout after 30 minutes of inactivity
- **Heartbeat Monitoring**: Regular server pings to detect active sessions
- **Manual Override**: Option to manually check out or stay active

### For Admins:
- **End-of-Day Cleanup**: API endpoint to close unclosed sessions
- **Monitoring**: View auto-checkout events in logs

### API Endpoints:
- `POST /api/attendance/heartbeat` - Employee heartbeat ping
- `POST /api/attendance/auto-checkout` - Automatic checkout
- `POST /api/attendance/cleanup` - End-of-day cleanup (requires API key)

### Cron Job Setup:
To automatically close unclosed sessions at end of day, set up a cron job:
```bash
# Run at 11:59 PM every day
59 23 * * * curl -X POST -H "Authorization: Bearer your-secret-cron-key" http://your-domain/api/attendance/cleanup
```
