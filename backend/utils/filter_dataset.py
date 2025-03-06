import pandas as pd

# Load the dataset with necessary columns
df = pd.read_csv('dataset/powerliftingdataset.csv', usecols=[
    'Sex', 'Event', 'Equipment', 'Age', 'Division', 'BodyweightKg', 'WeightClassKg',
    'Squat1Kg', 'Squat2Kg', 'Squat3Kg',
    'Bench1Kg', 'Bench2Kg', 'Bench3Kg',
    'Deadlift1Kg', 'Deadlift2Kg', 'Deadlift3Kg',
    'Federation'
])

# Filter rows
filtered_df = df[
    (df['Federation'].isin(['USAPL', 'IPF'])) &
    (df['Event'] == 'SBD') &
    (df['Equipment'] == 'Raw')
].copy()

# Drop columns used only for filtering
filtered_df.drop(columns=['Federation', 'Event', 'Equipment'], inplace=True)

# Save the filtered dataset
filtered_df.to_csv('dataset/usapl_ipf_powerlifting.csv', index=False)
print(f"Saved filtered dataset with {len(filtered_df)} rows to 'usapl_ipf_powerlifting.csv'")