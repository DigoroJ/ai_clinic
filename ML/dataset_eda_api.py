
from pathlib import Path
from io import BytesIO

import joblib
import pandas as pd
from flask import Flask, jsonify, request


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "disease_dataset_1000.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "best_model.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

MAX_FILE_SIZE = 20 * 1024 * 1024

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

FEATURES = [
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

NUMERIC_FEATURES = [
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


# --------------------------------------------------
# ERRORS
# --------------------------------------------------

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "CSV file must be 20 MB or smaller."
    }), 413


# --------------------------------------------------
# DATASET ANALYSIS
# --------------------------------------------------

def analyse_dataframe(df, dataset_name):
    # Remove completely empty rows and columns.
    df = df.dropna(how="all").dropna(axis=1, how="all")

    if df.empty or len(df.columns) == 0:
        raise ValueError("The dataset contains no usable data.")

    missing = df.isna().sum()

    columns = [
        {
            "name": str(column),
            "dataType": str(df[column].dtype),
            "missingValues": int(missing[column]),
            "uniqueValues": int(df[column].nunique(dropna=True)),
        }
        for column in df.columns
    ]

    preview_df = df.head(10).astype(object)
    preview_df = preview_df.where(preview_df.notna(), None)

    return {
        "datasetName": dataset_name,
        "stats": {
            "records": int(len(df)),
            "features": int(len(df.columns)),
            "missingValues": int(missing.sum()),
            "duplicates": int(df.duplicated().sum()),
        },
        "columns": columns,
        "missingByColumn": {
            str(column): int(missing[column])
            for column in df.columns
        },
        "preview": preview_df.to_dict(orient="records"),
    }


def read_csv_file(file_bytes):
    try:
        return pd.read_csv(BytesIO(file_bytes))
    except pd.errors.EmptyDataError as exc:
        raise ValueError("The CSV file is empty.") from exc
    except (pd.errors.ParserError, UnicodeDecodeError) as exc:
        raise ValueError(
            "Unable to read the CSV. Check its format and encoding."
        ) from exc


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/dataset/eda/current")
def analyse_current_dataset():
    if not DATA_PATH.exists():
        return jsonify({
            "error": "Default dataset not found in ML/data."
        }), 404

    try:
        df = pd.read_csv(DATA_PATH)
        result = analyse_dataframe(df, DATA_PATH.name)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        app.logger.exception("Default dataset analysis failed")
        return jsonify({
            "error": "Could not analyse the current dataset."
        }), 500


@app.post("/dataset/eda")
def analyse_uploaded_dataset():
    uploaded_file = request.files.get("file")

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({
            "error": "Please select a CSV file."
        }), 400

    if not uploaded_file.filename.lower().endswith(".csv"):
        return jsonify({
            "error": "Only CSV files are supported."
        }), 400

    try:
        df = read_csv_file(uploaded_file.read())
        result = analyse_dataframe(df, uploaded_file.filename)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        app.logger.exception("Uploaded dataset analysis failed")
        return jsonify({
            "error": "Could not analyse the uploaded dataset."
        }), 500


# --------------------------------------------------
# MODEL PREDICTION
# --------------------------------------------------

def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Trained model not found. Run train_model.py first."
        )

    if not METADATA_PATH.exists():
        raise FileNotFoundError(
            "Model metadata not found. Run train_model.py first."
        )

    model = joblib.load(MODEL_PATH)

    import json

    with open(METADATA_PATH, encoding="utf-8") as file:
        metadata = json.load(file)

    return model, metadata


@app.post("/predict")
def predict_disease():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "error": "Send a JSON object containing patient features."
        }), 400

    missing = [feature for feature in FEATURES
               if feature not in payload]

    if missing:
        return jsonify({
            "error": "Missing required features.",
            "missingFeatures": missing,
        }), 400

    row = {feature: payload[feature] for feature in FEATURES}

    # Validate numerical inputs.
    for feature in NUMERIC_FEATURES:
        value = row[feature]

        if isinstance(value, bool) or not isinstance(
            value, (int, float)
        ):
            return jsonify({
                "error": f"{feature} must be a number."
            }), 400

        if not pd.notna(value):
            return jsonify({
                "error": f"{feature} must be a finite number."
            }), 400

    for feature in [
        "fever", "cough", "rash", "headache", "vomiting",
        "fatigue", "sore_throat", "breathing_issue",
        "travel_history",
    ]:
        if row[feature] not in (0, 1):
            return jsonify({
                "error": f"{feature} must be 0 or 1."
            }), 400

    if row["age"] < 0 or row["days_symptoms"] < 0:
        return jsonify({
            "error": "Age and days_symptoms cannot be negative."
        }), 400

    if row["temperature"] < 25 or row["temperature"] > 45:
        return jsonify({
            "error": "Temperature must be in Celsius and within 25–45."
        }), 400

    if not isinstance(row["gender"], str) or not row["gender"].strip():
        return jsonify({
            "error": "gender must be a non-empty string."
        }), 400

    try:
        model, metadata = load_model()

        input_df = pd.DataFrame(
            [{feature: row[feature] for feature in FEATURES}],
            columns=FEATURES,
        )

        prediction = str(model.predict(input_df)[0])

        response = {
            "prediction": prediction,
            "model": metadata.get("model_name", "Unknown"),
            "disclaimer": (
                "This experimental model is not a diagnosis. "
                "It must not replace assessment by a qualified clinician."
            ),
        }

        # Include probabilities if the model supports them.
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_df)[0]
            response["probabilities"] = {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    model.classes_, probabilities
                )
            }

        return jsonify(response)

    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": "The model could not process this prediction."
        }), 500


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False,
    )
