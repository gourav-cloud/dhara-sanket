# DHARA-SANKET AI

**Smart India Hackathon 2026** | Problem Statement ID: `SIH26017`

## What is DHARA-SANKET AI?

DHARA-SANKET AI is an AI-based system that predicts delays in land acquisition projects early. It helps authorities track risks, understand delay reasons, and take timely action.

## Main Features

- View land acquisition risk on an interactive map
- See project details, statuses, and risk levels
- Add new locations manually and get instant risk predictions
- Use interactive simulations to test how conditions affect risk
- Read clear delay reason explanations with suggested actions
- Filter projects by risk level and delay reason

## Technologies Used

- **Frontend:** React, Vite, React Router, Lucide React
- **Backend:** Python FastAPI, Uvicorn, Pydantic
- **AI model:** Scikit-learn demonstration model with feature contribution explanations
- **Mapping:** React Leaflet with OpenStreetMap
- **Planned:** XGBoost and SHAP, authentication, role-based access, PostgreSQL/PostGIS

## Try It Out Locally

- **Frontend:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **API:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

Deployment URLs and repository links can be added here when available.

## How to Run Locally

### Backend

From the project root:

1. Create and activate a Python virtual environment.
2. Install the backend packages:

```powershell
python -m pip install -r backend/requirements.txt
```

3. Start the API:

```powershell
npm run backend
```

The backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Frontend

From the project root:

1. Install the frontend packages:

```powershell
npm install
```

2. Start the Vite development server:

```powershell
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

## How to Use

- Explore the dashboard for overall project risk metrics.
- Use the filters to narrow projects by risk level or delay reason.
- Open the map and select **Add location**.
- Click a location, adjust the risk inputs, and run a prediction.
- Save the location to keep its risk marker on the map.
- Use the What-if simulation sliders to test different conditions.
- Open the analysis view to review contributing factors and recommendations.
- Visit the Projects page to search the portfolio and open project details.

## Validation

Build the frontend with:

```powershell
npm run build
```

Thank you for checking out DHARA-SANKET AI!

**Smart India Hackathon 2026**
