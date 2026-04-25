# 🗄 Database Schema

## 👤 User

- \_id
- name
- email
- password
- createdAt

## 💰 Transaction

- \_id
- userId
- amount
- category
- description
- type (income/expense)
- date
- createdAt

## 🏦 Account

- \_id
- userId
- name
- balance

## 🎯 Budget

- \_id
- userId
- category
- limit
- month

## 🎯 Goal

- \_id
- userId
- title (Vacation, Laptop, etc.)
- targetAmount
- savedAmount
- targetDate
- monthlyContribution (optional)
- createdAt

## ⚠️ Notes

- Keep categories standardized
- Store raw descriptions for ML
- Goals should be linked to user savings behavior
