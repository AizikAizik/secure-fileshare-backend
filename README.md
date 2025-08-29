# Secure File-Sharing Backend

## Overview

This repository contains the backend for the Secure File-Sharing Platform with End-to-End Encryption (E2EE), developed as part of an MSc Computer Science project at Nottingham Trent University. The backend, built with Node.js, Express, and TypeScript, provides a zero-knowledge API for user authentication, file upload/download, and secure sharing using AWS S3 and MongoDB.

## Features

- User registration and JWT-based authentication.
- Encrypted file storage and retrieval with client-side E2EE.
- Multi-user file sharing with key re-encryption.
- Security mitigations (CSRF, XSS prevention).

## Setup

1. Clone the repository: `git clone https://github.com/AizikAizik/secure-fileshare-backend.git`.
2. Install dependencies: `yarn install`.
3. Configure `.env` with MongoDB, AWS, and JWT credentials (see user_manual.txt).
4. Run: `yarn dev` (requires nodemon).

## Technologies

- Node.js, Express, TypeScript
- MongoDB, AWS S3
- Helmet, csurf, Morgan (security/logging)

## License

MIT License (see LICENSE file).

## Author

Isaac Ayodeji Ogunleye, 2025
