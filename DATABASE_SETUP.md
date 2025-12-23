# Database Setup Instructions for Collaborators

## Prerequisites
- MySQL installed on your computer
- MySQL running on port 3306

## Steps to Set Up the Database

### Step 1: Create the Database
Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
mysql -u root -p -e "CREATE DATABASE springpro_db;"
```

**Note:** You'll be asked for your MySQL root password. Enter it and press Enter.

### Step 2: Import the Database Dump
Navigate to the project folder and run:

```bash
mysql -u root -p springpro_db < springpro_db_dump.sql
```

**Note:** Again, enter your MySQL root password when prompted.

### Step 3: Update Your Database Password
Open the file: `backend/main/resources/application.properties`

Find line 6 and change it to YOUR MySQL password:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```

**IMPORTANT:** Do NOT commit this change to GitHub! This file should remain local to your machine.

### Step 4: Verify the Setup
Run the Spring Boot application. If it starts without errors, your database is set up correctly!

## Troubleshooting

**Error: "Access denied for user 'root'"**
- Make sure you're using the correct MySQL password in `application.properties`

**Error: "Unknown database 'springpro_db'"**
- Make sure you completed Step 1 (creating the database)

**Error: "mysqldump/mysql command not found"**
- Add MySQL to your system PATH or use the full path:
  - Windows: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`
  - Mac: `/usr/local/mysql/bin/mysql`

## Need Help?
Contact the project owner if you encounter any issues.
