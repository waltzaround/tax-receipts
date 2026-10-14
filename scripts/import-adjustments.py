"""Build fiscal-year CPI averages and annual population denominators from archived sources."""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CPI_URL = "https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-June-2025-quarter/Download-data/consumers-price-index-june-2025-quarter-index-numbers.csv"
POP_URL = "https://api.worldbank.org/v2/country/NZL/indicator/SP.POP.TOTL?format=json&per_page=100"
cpi_path = ROOT / "data/treasury/cpi-index.csv"
pop_path = ROOT / "data/treasury/population-world-bank.json"
with cpi_path.open() as source:
    cpi = {row["Period"]: float(row["Data_value"]) for row in csv.DictReader(source)
           if row["Series_reference"] == "CPIQ.SE9A"}
raw_population = json.loads(pop_path.read_text())
assert raw_population[0]["pages"] == 1
population = {int(row["date"]): row["value"] for row in raw_population[1] if row["value"] is not None}

def fiscal_cpi(year, month):
    quarters = [(year - 1, 6), (year - 1, 9), (year - 1, 12), (year, 3)] if month == 3 else [(year - 1, 9), (year - 1, 12), (year, 3), (year, 6)]
    values = [cpi.get(f"{y}.{m:02}") for y, m in quarters]
    assert all(value is not None and value > 0 for value in values), (year, month)
    return sum(values) / 4

periods = {}
for year in range(1972, 2026):
    assert population[year] > 0
    for month in [3, 6]:
        periods[f"{year}-{month}"] = {"cpi": fiscal_cpi(year, month), "population": population[year]}
output = {"baseYear": 2025, "baseCpi": fiscal_cpi(2025, 6), "periods": periods,
          "cpiSource": CPI_URL, "populationSource": POP_URL,
          "populationUpdated": raw_population[0]["lastupdated"],
          "cpiSha256": hashlib.sha256(cpi_path.read_bytes()).hexdigest(),
          "populationSha256": hashlib.sha256(pop_path.read_bytes()).hexdigest()}
(ROOT / "src/data/adjustments.json").write_text(json.dumps(output, indent=2) + "\n")
print(f"Imported {len(periods)} fiscal periods. Base CPI: {output['baseCpi']}; population 2025: {population[2025]}")
