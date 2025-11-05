# lidarviewerloadtesting
LidarViewerLoadTesting


# Token Generation & Load Testing Project

This project automates the process of generating authentication tokens, converting them into access tokens, and then using those tokens to run performance or functional tests (e.g., via k6).  

The workflow is divided into three main scripts:

1. `npm run generate-tokens.js`
2. `npm run generate-access-tokens`
3. `npm run start`

Each script builds on the output of the previous one to ensure the environment is correctly prepared before executing the main logic.

---

## Project Overview

This repository contains Node.js scripts that help automate the token-based login process used for testing APIs.  
It is especially useful in test environments where you need to:
- Generate multiple authentication tokens.
- Convert them into access tokens via an API.
- Run automated load or functional tests using those tokens.

---

## Prerequisites

Before running any script, ensure the following are installed and configured:

- [Node.js](https://nodejs.org/) v18 or higher  
- npm (comes bundled with Node.js)  
- Network access to your test API endpoint (e.g., `https://testing.lidartechsolutions.com/api/login`)  
- Proper `.env` file or environment variables (if required)

---

## 1. `npm run generate-tokens.js`

### **Description**
This script is responsible for generating or refreshing the base encrypted tokens used for login;  

Typically, these are temporary or user-level tokens required before exchanging them for access tokens.

### **Usage**
```npm run generate-tokens.js ```

##  2. `npm run generate-access-tokens`

### **Description**
This script takes the tokens created by `generate-tokens.js` and exchanges them for **access tokens** by sending each one to the configured API endpoint.  

It is often used in test setups where tokens must be validated or converted before execution of automated tests.

### **Usage**
```npm run generate-access-tokens```


## 3. `npm run start`

### **Description**
This command runs the **main execution script** of the project.  
It is typically used to start the automated test suite or load testing process — most commonly using **k6**, a modern load testing tool.

The `npm run start` command internally triggers the `k6 run` command with the specified test file (for example, `multi-user-test.js`), executing the configured performance or functional test scenario.

---

### **Usage**
```npm run start```
