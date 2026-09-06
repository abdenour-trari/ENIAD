import pandas as pd
import numpy as np
import os
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder

train_path = 'train.csv'
test_path = 'test.csv'

for dirname, _, filenames in os.walk('/kaggle/input'):
    for filename in filenames:
        if filename == 'train.csv':
            train_path = os.path.join(dirname, filename)
        if filename == 'test.csv':
            test_path = os.path.join(dirname, filename)

print(f"Chargement de : {train_path}")
train = pd.read_csv(train_path)
test = pd.read_csv(test_path)

def prepare_data(df):
    df['S1_Success'] = df['Curricular units 1st sem (approved)'] / df['Curricular units 1st sem (enrolled)'].replace(0, 1)
    df['S2_Success'] = df['Curricular units 2nd sem (approved)'] / df['Curricular units 2nd sem (enrolled)'].replace(0, 1)
    
    df['Financial_Risk'] = (df['Debtor'] == 1).astype(int) + (df['Tuition fees up to date'] == 0).astype(int)
    
    df['Grade_Drop'] = df['Curricular units 1st sem (grade)'] - df['Curricular units 2nd sem (grade)']
    
    df['Academic_Stability'] = df['Scholarship holder'] + df['Tuition fees up to date']
    
    df['Total_Grade'] = (df['Curricular units 1st sem (grade)'] + df['Curricular units 2nd sem (grade)']) / 2
    
    return df

train = prepare_data(train)
test = prepare_data(test)

X = train.drop(['id', 'Target'], axis=1)
y = train['Target']
X_test = test.drop(['id'], axis=1)

le = LabelEncoder()
y_encoded = le.fit_transform(y)

model = LGBMClassifier(
    n_estimators=1500,      
    learning_rate=0.01,      
    num_leaves=45,           
    max_depth=12,
    min_child_samples=15,
    subsample=0.8,
    colsample_bytree=0.7,    
    random_state=42,
    verbosity=-1
)

print("Entraînement en cours...")
model.fit(X, y_encoded)

print("Prédiction...")
preds = model.predict(X_test)
final_labels = le.inverse_transform(preds)

submission = pd.DataFrame({
    'id': test['id'],
    'Target': final_labels
})

submission.to_csv('submission.csv', index=False)
print("Terminé ! Le fichier 'submission.csv' est prêt.")