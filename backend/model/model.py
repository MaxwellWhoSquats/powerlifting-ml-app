import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from io import BytesIO
import base64
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
ATTEMPT_COLUMNS = ["Squat1Kg", "Squat2Kg", "Squat3Kg", 
                   "Bench1Kg", "Bench2Kg", "Bench3Kg", 
                   "Deadlift1Kg", "Deadlift2Kg", "Deadlift3Kg"]
ATTEMPT_NAMES = [
    "Squat 1st Attempt", "Squat 2nd Attempt", "Squat 3rd Attempt",
    "Bench 1st Attempt", "Bench 2nd Attempt", "Bench 3rd Attempt",
    "Deadlift 1st Attempt", "Deadlift 2nd Attempt", "Deadlift 3rd Attempt"
]
FAILURE_COLUMNS = [f"{col}_Failed" for col in ATTEMPT_COLUMNS]
PARAMETERS = ["Division", "BodyweightKg", "Sex"]
BASE_PATH = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_PATH, "..", "..", "dataset", "ready_for_model.pkl")
MODEL_PATH = os.path.join(BASE_PATH, "model.pkl")
ENCODER_PATH = os.path.join(BASE_PATH, "..", "utils", "label_encoder.pkl")

# Load and further refine data
def load_data():
    try:
        df = pd.read_pickle(DATA_PATH)
        logger.info(f"Dataset loaded successfully.")
        df = df.dropna(subset=ATTEMPT_COLUMNS)
        
        X = df[PARAMETERS + FAILURE_COLUMNS].copy()
        y = df[ATTEMPT_COLUMNS]
        
        label_encoder = LabelEncoder()
        X.loc[:, "Division"] = label_encoder.fit_transform(X["Division"])
        logger.info("Data processed successfully.")
        
        return X, y, label_encoder, df
    except FileNotFoundError:
        raise FileNotFoundError(f"Data file not found at {DATA_PATH}")
    except Exception as e:
        raise Exception(f"Error loading data: {str(e)}")

# Create/Train model using RandomizedSearchCV
def train_model(X, y):
    params = {
        "n_estimators": [100, 200],
        "max_depth": [10, 20, None],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
        "max_features": ["sqrt", "log2"]
    }
    rf = RandomForestRegressor(random_state=42)
    random_search = RandomizedSearchCV(
        rf, params, n_iter=10, cv=5, scoring="neg_mean_squared_error", 
        n_jobs=-1, verbose=2, random_state=42
    )
    logger.info("Starting RandomizedSearchCV training...")
    random_search.fit(X, y)
    model = random_search.best_estimator_
    logger.info(f"Best parameters: {random_search.best_params_}")
    joblib.dump(model, MODEL_PATH)
    logger.info("Model saved successfully.")
    return model

# Create attempt recommendations (PREDICTIVE ML FUNCTIONALITY)
def predict_attempts(model, label_encoder, division, bodyweight, sex):
    try:
        division_encoded = label_encoder.transform([division])[0]
        input_data = [division_encoded, bodyweight, sex] + [0] * len(FAILURE_COLUMNS)
        input_df = pd.DataFrame([input_data], columns=PARAMETERS + FAILURE_COLUMNS)
        predictions = model.predict(input_df)[0]
        attempt_recommendations = {
            "Squat": {
                "1st Attempt": round(predictions[0], 2),
                "2nd Attempt": round(predictions[1], 2),
                "3rd Attempt": round(predictions[2], 2)
            },
            "Bench": {
                "1st Attempt": round(predictions[3], 2),
                "2nd Attempt": round(predictions[4], 2),
                "3rd Attempt": round(predictions[5], 2)
            },
            "Deadlift": {
                "1st Attempt": round(predictions[6], 2),
                "2nd Attempt": round(predictions[7], 2),
                "3rd Attempt": round(predictions[8], 2)
            }
        }
        return attempt_recommendations
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise Exception(f"Prediction failed: {str(e)}")

# Generate visualizations based on dataset
def generate_visualizations(df, division, bodyweight, sex, tolerance=5.0):
    filtered_df = df[
        (df["Division"] == division) &
        (df["Sex"] == sex) &
        (df["BodyweightKg"].between(bodyweight - tolerance, bodyweight + tolerance))
    ]

    if filtered_df.empty:
        logger.warning("No data matches the specified filters.")
        return {"error": "No data matches the specified filters."}, None, None, None

    # 1. Box Plot
    plt.figure(figsize=(12, 8))
    data_to_plot = [filtered_df[col][filtered_df[col] > 0] for col in ATTEMPT_COLUMNS]
    plt.boxplot(data_to_plot, labels=ATTEMPT_NAMES, patch_artist=True,
                boxprops=dict(facecolor="lightblue", color="blue"),
                medianprops=dict(color="red"))
    plt.title(f"Lift Attempts Distribution\n(Division: {division}, "
              f"Bodyweight: {bodyweight}±{tolerance} kg, Sex: {'F' if sex == 0 else 'M'})")
    plt.xlabel("Lift Attempt")
    plt.ylabel("Weight (kg)")
    plt.xticks(rotation=45)
    plt.grid(True, linestyle="--", alpha=0.7)
    buf1 = BytesIO()
    plt.savefig(buf1, format="png", bbox_inches="tight")
    box_plot = base64.b64encode(buf1.getbuffer()).decode("utf-8")
    plt.close()

   # 2. Heatmap
    plt.figure(figsize=(10, 6))
    progression = np.zeros((3, 2))
    for i, lift in enumerate(["Squat", "Bench", "Deadlift"]):
        col1 = f"{lift}1Kg"
        col2 = f"{lift}2Kg"
        col3 = f"{lift}3Kg"
        prog_1_2 = filtered_df[col2] / filtered_df[col1].replace(0, np.nan) - 1
        prog_2_3 = filtered_df[col3] / filtered_df[col2].replace(0, np.nan) - 1
        progression[i, 0] = prog_1_2.mean() * 100
        progression[i, 1] = prog_2_3.mean() * 100
    sns.heatmap(progression, annot=True, fmt=".1f", cmap="YlGnBu",
                xticklabels=["1st to 2nd", "2nd to 3rd"],
                yticklabels=["Squat", "Bench", "Deadlift"])
    plt.title(f"Average Attempt Progression (% Increase)\n(Division: {division}, "
              f"Bodyweight: {bodyweight}±{tolerance} kg, Sex: {'F' if sex == 0 else 'M'})")
    buf2 = BytesIO()
    plt.savefig(buf2, format="png", bbox_inches="tight")
    heatmap_plot = base64.b64encode(buf2.getbuffer()).decode("utf-8")
    plt.close()

    # 3. Stacked Bar Chart
    plt.figure(figsize=(8, 6))
    lift_means = [
        filtered_df["Squat3Kg"].mean(),
        filtered_df["Bench3Kg"].mean(),
        filtered_df["Deadlift3Kg"].mean()
    ]
    total = sum(lift_means)
    plt.bar([0], lift_means[0], label="Squat 3rd Attempt", color="skyblue")
    plt.bar([0], lift_means[1], bottom=lift_means[0], label="Bench 3rd Attempt", color="lightgreen")
    plt.bar([0], lift_means[2], bottom=lift_means[0] + lift_means[1], label="Deadlift 3rd Attempt", color="salmon")
    plt.title(f"Average Final Lift Contributions\n(Division: {division}, "
              f"Bodyweight: {bodyweight}±{tolerance} kg, Sex: {'F' if sex == 0 else 'M'})")
    plt.ylabel("Weight (kg)")
    plt.xticks([])
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.7, axis="y")
    buf3 = BytesIO()
    plt.savefig(buf3, format="png", bbox_inches="tight")
    bar_plot = base64.b64encode(buf3.getbuffer()).decode("utf-8")
    plt.close()

    return {}, box_plot, heatmap_plot, bar_plot

# Initialize model
def initialize_model():
    X, y, label_encoder, df = load_data()
    try:
        model = joblib.load(MODEL_PATH)
        logger.info("Loaded pre-trained model.")
    except FileNotFoundError:
        logger.info("Training new model with RandomizedSearchCV...")
        model = train_model(X, y)
        joblib.dump(label_encoder, ENCODER_PATH)
    return model, label_encoder, df