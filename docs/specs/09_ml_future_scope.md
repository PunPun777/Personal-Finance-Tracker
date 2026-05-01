# 🤖 ML Future Scope — 🛠️ Planned (Phase 2)

## Models

### Categorization

- TF-IDF + Logistic Regression
- Auto-categorize transactions from description text
- Train on user-corrected data

### Prediction

- Prophet (time-series forecasting)
- Predict next-month expenses by category

### Anomaly Detection

- Isolation Forest
- Flag unusual spending patterns
- Alert users to potential waste/fraud

### 🎯 Goal Intelligence

- Predict if goal is achievable based on historical savings rate
- Suggest required savings rate adjustments
- Recommend budget reallocation to meet goal deadlines

## ML Service

- FastAPI (Python microservice)
- Separate from Node.js backend
- Communicates via REST API

## Data Needed

The MERN application is already collecting the required training data:

- ✅ Transaction data (amount, category, description, date, type)
- ✅ Savings patterns (goal-linked transactions)
- ✅ Goal progress (target vs actual via aggregation)
- ✅ Budget utilization (per-category limits vs spend)

## Feedback Loop

- User corrections improve model accuracy
- Re-train periodically on updated data
- A/B test recommendations before production rollout

## Integration Architecture

```
React Frontend
     ↓
Node.js API  ←→  MongoDB
     ↓
FastAPI ML Service (Python)
     ↓
Scikit-learn / Prophet / PyTorch
```
