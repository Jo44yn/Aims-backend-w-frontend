# AIMS — Contract-to-Cash Procurement System

Decoupled web application for managing contracts, purchase orders, inventory, QA inspections, and BIR tax withholding billing statements.

- **Backend:** Laravel 13 (REST API & Sanctum Authentication)
- **Frontend:** Vite, Alpine.js, Tailwind CSS
- **Database:** MySQL 8

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
- [PHP](https://www.php.net/) (>= 8.2)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) (>= 18) & `npm`
- [MySQL](https://www.mysql.com/) Server (e.g., via XAMPP, Laragon, or standalone MySQL service)

---

## 1. Backend Setup (`aims-backend`)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd aims-backend
2. Install PHP package dependencies:
    Bash

    composer install
3. Create your local environment configuration file:
    Bash


    cp .env.example .env
4. Generate a new application key:
    Bash


    php artisan key:generate
5. Install REST API support and publish Sanctum configuration (if setting up fresh):
    Bash

    
    php artisan install:api
6. Open .env in your code editor and configure your MySQL database connection details:

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=aims
    DB_USERNAME=root
    DB_PASSWORD=your_mysql_password
7. Run database migrations and seed all initial roles, demo accounts, and contract data:
    Bash


    php artisan migrate:fresh --seed
8. Start the local Laravel API server:
    Bash


    php artisan serve 

ACCOUNTS

    Role,   Email,  Password
System Administrator,   admin@aimforce.example (or admin@aimforce.ph),  password
Owner / General Manager,    gm@aimforce.example,    password
Purchasing Officer, purchasing@aimforce.example, password
Warehouse Manager,  warehouse@aimforce.example,   password
QA Inspector,   qa@aimforce.example,   password
Accounting, accounting@aimforce.example, password
Client Portal User, client@1id.example (portal.html),    password
    