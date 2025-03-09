import pandas as pd
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

df = pd.read_csv("dataset/usapl_powerlifting.csv")

ATTEMPT_COLUMNS = ["Squat1Kg", "Squat2Kg", "Squat3Kg",
                   "Bench1Kg", "Bench2Kg", "Bench3Kg",
                   "Deadlift1Kg", "Deadlift2Kg", "Deadlift3Kg"]

df = df.dropna(subset=ATTEMPT_COLUMNS, how="all")
df = df.dropna(subset=["Age", "BodyweightKg"])

# Simplify "Division" column
def simplify_division(row):
    division = str(row["Division"]).strip().upper()
    if "OPEN" in division or "-O" in division:
        return "Open"
    elif "JUNIOR" in division or "-JR" in division:
        return "Junior"
    elif "TEEN" in division or "-T" in division:
        return "Teen"
    elif "YOUTH" in division or "Y" in division:
        return "Youth"
    elif "MASTER" in division or "-M":
        return "Master"
    else:
        return None

df["Division"] = df.apply(simplify_division, axis=1)
df["Sex"] = df["Sex"].map({"F": 0, "M": 1})

for col in ATTEMPT_COLUMNS:
    df[f"{col}_Failed"] = df[col].apply(lambda x: 1 if x < 0 else 0)
    df[col] = df[col].apply(lambda x: abs(x) if x < 0 else x)


logger.info(f"Means of attempt columns: \n{df[ATTEMPT_COLUMNS].mean()}")
df.to_pickle("dataset/ready_for_model.pkl")