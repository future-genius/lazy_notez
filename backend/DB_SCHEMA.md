# Lazy Notez Database Schema

## users
- `_id` ObjectId
- `userId` String (unique, app-level user_id)
- `name` String
- `username` String (unique)
- `email` String (unique, required)
- `password` String (hashed)
- `loginMethod` Enum: `google | manual`
- `role` Enum: `super_admin | admin | faculty | student | user`
- `status` Enum: `active | inactive`
- `refreshTokens` String[]
- `lastLogin` Date
- `registrationDate` Date
- `universityRegisterNumber` String
- `department` String
- `createdAt` Date

## resources
- `_id` ObjectId
- `department` String
- `semester` String
- `subject` String
- `title` String
- `googleDriveUrl` String
- `uploadedByName` String
- `uploadedBy` ObjectId -> users._id
- `downloadCount` Number
- `uploadDate` Date
- `description` String
- `tags` String[]
- `createdAt` Date
- `updatedAt` Date

## activity_logs
- `_id` ObjectId
- `user` ObjectId -> users._id
- `action` String
- `ip` String
- `meta` Mixed
- `createdAt` Date

## feedback
- existing schema retained

## notes
- existing schema retained

## about
- existing schema retained
