# Best Realty Video Course Platform

A deployed video course platform built for Best Realty to manage, sell, and securely deliver online course content.

Live site: https://best-realty-video-hosting.vercel.app/

## What It Does

This platform allows users to browse courses, sign in with secure authentication, access enrolled course content, and watch protected lesson videos. Admin users can create courses, add lessons, upload videos, and manage course content through an admin dashboard.

## Key Features

- User authentication with Amazon Cognito
- Role-based access for admins and customers
- Course and lesson management
- Secure video uploads to Amazon S3
- Private video delivery through CloudFront signed URLs
- Serverless backend using AWS Lambda and API Gateway
- Course data stored in DynamoDB
- Frontend deployed on Vercel with Next.js

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Vercel

**Backend**
- Python
- FastAPI
- AWS Lambda
- API Gateway

**AWS Infrastructure**
- Cognito
- DynamoDB
- S3
- CloudFront
- IAM

**Payments**
- Stripe integration in progress

## Architecture Overview

The frontend communicates with a FastAPI backend deployed on AWS Lambda through API Gateway. Users authenticate through Cognito. Course, lesson, user, purchase, and access data are stored in DynamoDB. Videos are uploaded to a private S3 bucket and delivered through CloudFront using signed URLs, ensuring users can only access videos they are authorized to view.

## Project Status

The core platform is deployed and functional. Current work includes improving customer dashboards, course progress tracking, Stripe payment flow, and additional admin tools.

## Why This Project Matters

This project was built to solve a real business need: securely hosting and delivering online course content while giving administrators control over courses, lessons, and media. It demonstrates backend development, cloud infrastructure, authentication, authorization, secure media delivery, and production deployment.
