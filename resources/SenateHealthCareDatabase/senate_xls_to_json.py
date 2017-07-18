
"""Quick'n'dirty minimal script to convert excel file containing senate health info to json"""

import pandas as pd

xls_filename = "AVG & HIGH premium increases for all states_with $75K June 25.xlsx"

columNames = ["state", "20", "30", "40",
              "45", "50", "55", "60", "75"]

df = pd.read_excel(xls_filename, sheetname=0, skiprows=2, names=columNames)
df = df[df["75"].notnull()]
df.head()
df.tail()

# reshape data so that we have a unique records of form (state, income_range, premium_amount)
data = pd.melt(df, id_vars="state", var_name="income_range",
               value_name="premium")

data.head()
data.tail()

with open('senate_health_data.json', 'w') as f:
    f.write(data.to_json(orient='records'))
