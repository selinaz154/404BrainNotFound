import pandas as pd

medications_request = pd.read_csv('csv/cleaned_medication_request.csv')

# Example of usage of pandas
# medications_request = pd.merge(patients, conditions, on='PatientID', how='left')

# Convert DataFrame to JSON and save it
medications_request.to_json("json/cleaned_medication_request.json", orient="records", indent=4)