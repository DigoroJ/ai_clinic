
from pathlib import Path
import json

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "disease_dataset_1000.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD AND VALIDATE DATASET
# --------------------------------------------------

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}\n"
        "Place disease_dataset_1000.csv in the ML/data folder."
    )

df = pd.read_csv(DATA_PATH)

target = "disease"

# Exclude severity and humidity_level for the first
# prototype because they are not currently part of
# the planned patient symptom-checker inputs.
features = [
    "fever",
    "cough",
    "rash",
    "headache",
    "vomiting",
    "fatigue",
    "sore_throat",
    "breathing_issue",
    "age",
    "gender",
    "temperature",
    "days_symptoms",
    "travel_history",
]

required_columns = features + [target]
missing_columns = [
    col for col in required_columns if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Dataset is missing columns: {missing_columns}"
    )

df = df[required_columns].copy()

if df.empty:
    raise ValueError("The dataset contains no records.")

if df[target].isna().any():
    raise ValueError("The disease target contains missing values.")

if df[target].nunique() < 2:
    raise ValueError("At least two disease classes are required.")

X = df[features]
y = df[target].astype(str)

print("\nDataset shape:", df.shape)
print("\nDisease distribution:")
print(y.value_counts())


# --------------------------------------------------
# TRAIN / TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# --------------------------------------------------
# PREPROCESSING
# --------------------------------------------------

numeric_features = [
    "fever",
    "cough",
    "rash",
    "headache",
    "vomiting",
    "fatigue",
    "sore_throat",
    "breathing_issue",
    "age",
    "temperature",
    "days_symptoms",
    "travel_history",
]

categorical_features = ["gender"]

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features),
])


# --------------------------------------------------
# FOUR CLASSIFICATION MODELS
# --------------------------------------------------

models = {
    "Logistic Regression": LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        random_state=42,
    ),

    "Decision Tree": DecisionTreeClassifier(
        class_weight="balanced",
        random_state=42,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    ),

    "K-Nearest Neighbors": KNeighborsClassifier(
        n_neighbors=5,
    ),
}


# --------------------------------------------------
# TRAIN AND EVALUATE
# --------------------------------------------------

results = []
trained_models = {}

for name, classifier in models.items():
    print(f"\nTraining {name}...")

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier),
    ])

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    metrics = {
        "model": name,
        "accuracy": accuracy_score(y_test, predictions),
        "precision_macro": precision_score(
            y_test, predictions, average="macro",
            zero_division=0
        ),
        "recall_macro": recall_score(
            y_test, predictions, average="macro",
            zero_division=0
        ),
        "f1_macro": f1_score(
            y_test, predictions, average="macro",
            zero_division=0
        ),
    }

    results.append(metrics)
    trained_models[name] = pipeline

    print("\nMetrics:")
    print(json.dumps(metrics, indent=2))

    print("\nClassification report:")
    print(classification_report(
        y_test,
        predictions,
        zero_division=0,
    ))

    print("Confusion matrix:")
    print(confusion_matrix(
        y_test,
        predictions,
        labels=sorted(y.unique()),
    ))


# --------------------------------------------------
# SAVE COMPARISON AND BEST MODEL
# --------------------------------------------------

results_df = pd.DataFrame(results)
results_df = results_df.sort_values(
    by="f1_macro",
    ascending=False,
)

results_path = MODEL_DIR / "model_comparison.csv"
results_df.to_csv(results_path, index=False)

best_name = results_df.iloc[0]["model"]
best_model = trained_models[best_name]

joblib.dump(
    best_model,
    MODEL_DIR / "best_model.joblib",
)

metadata = {
    "model_name": best_name,
    "target": target,
    "features": features,
    "classes": sorted(y.unique()),
    "selection_metric": "macro_f1",
    "test_size": 0.20,
    "random_state": 42,
}

with open(
    MODEL_DIR / "model_metadata.json",
    "w",
    encoding="utf-8",
) as file:
    json.dump(metadata, file, indent=2)

print("\nModel comparison:")
print(results_df.to_string(index=False))

print(f"\nSelected model: {best_name}")
print(f"Comparison saved to: {results_path}")
print(f"Model saved to: {MODEL_DIR / 'best_model.joblib'}")
print("Training completed.")
