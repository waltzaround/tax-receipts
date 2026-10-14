"""Extract Treasury's published summary table; never infer missing amounts.

Run with Python 3 and openpyxl: python3 scripts/import-treasury.py
Add --download to refresh the archived workbooks from their official URLs.
"""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    (2024, "https://www.treasury.govt.nz/sites/default/files/2024-05/befu24-data-expense-tables.xlsx"),
    (2025, "https://www.treasury.govt.nz/sites/default/files/2025-05/befu25-data-expense-tables.xlsx"),
    (2026, "https://www.budget.govt.nz/budget/excel/befu2026/befu26-data-expense-tables.xlsx"),
]
HISTORY_URL = "https://www.treasury.govt.nz/sites/default/files/2026-01/fiscaltimeseries1972-2025-year-end25.xlsx"


def extract_history(path):
    workbook = openpyxl.load_workbook(path, data_only=True, read_only=True)
    rows = list(workbook["Spending"].values)
    names = ["Social security and welfare, GSF", "Health", "Education",
             "Core government services", "Law and order", "Defence",
             "Transport and communications", "Economic and industrial services",
             "Heritage, primary services, housing, environment and other",
             "Finance costs", "Net foreign exchange gains (−)/losses"]
    years = []
    for row in rows[4:58]:
        year = int(str(row[1])[:4])
        cash = year < 1994
        total = row[2 if cash else 3]
        assert isinstance(total, (int, float)) and total > 0
        categories = {}
        for col, name in enumerate(names, 6):
            value = row[col]
            assert value is None or isinstance(value, (int, float))
            if value is not None:
                categories[name] = round(value, 6)
        # Retain source differences explicitly; do not silently redistribute them.
        difference = round(total - sum(categories.values()), 6)
        if abs(difference) > .00001:
            categories["Unreconciled difference in published series"] = difference
        framework = "Cash" if cash else "Old GAAP" if year <= 1996 else "IFRS" if year <= 2004 else "PBE"
        years.append({"year": year, "status": "Actual", "total": round(total, 6),
                      "categories": categories, "publicationYear": 2026, "url": HISTORY_URL,
                      "sourceName": "Treasury historical fiscal series (January 2026)",
                      "yearEndMonth": 3 if year <= 1989 else 6,
                      "framework": framework, "gstInclusive": 1987 <= year <= 1993,
                      "totalLabel": "Financial net expenditure" if cash else "Core Crown expenses",
                      "reconciliationDifference": difference})
    assert [r["year"] for r in years] == list(range(1972, 2026))
    workbook.close()
    return {"url": HISTORY_URL, "sheet": "Spending", "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "years": years}


def extract(path, publication_year, url):
    workbook = openpyxl.load_workbook(path, data_only=True, read_only=True)
    rows = list(workbook["Core Crown Expense Tables"].values)
    header = next(i for i, row in enumerate(rows) if row[5] and str(row[5]).isdigit())
    columns = [i for i, value in enumerate(rows[header])
               if value and str(value).isdigit() and 2000 <= int(value) <= 2100]
    total_row = next(i for i, row in enumerate(rows) if row[3] == "Core Crown expenses")
    categories = [(i, row[3].strip()) for i, row in enumerate(rows)
                  if header + 2 <= i < total_row and isinstance(row[3], str)]
    assert len(categories) == 17, "Unexpected category structure"
    records = []
    for col in columns:
        status = rows[header + 1][col]
        assert status in ("Actual", "Forecast"), status
        values = {}
        for row, name in categories:
            value = rows[row][col]
            assert isinstance(value, (int, float)), f"Missing/non-numeric {name} at column {col}"
            values[name] = value
        total = rows[total_row][col]
        assert isinstance(total, (int, float)) and total > 0
        assert sum(values.values()) == total, f"Categories do not reconcile for {rows[header][col]}"
        records.append({"year": int(rows[header][col]), "status": status,
                        "total": total, "categories": values})
    workbook.close()
    return {"publicationYear": publication_year, "url": url,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "sheet": "Core Crown Expense Tables", "years": records}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()
    releases = []
    for year, url in SOURCES:
        path = ROOT / "data" / "treasury" / f"befu{year % 100}.xlsx"
        if args.download:
            with urlopen(url, timeout=60) as response:
                content = response.read()
            # Validate before replacing the archived source.
            temporary = path.with_suffix(".download.xlsx")
            temporary.write_bytes(content)
            extract(temporary, year, url)
            temporary.replace(path)
        releases.append(extract(path, year, url))
    history_path = ROOT / "data" / "treasury" / "fiscal-time-series-1972-2025.xlsx"
    if args.download:
        with urlopen(HISTORY_URL, timeout=60) as response:
            content = response.read()
        temporary = history_path.with_suffix(".download.xlsx")
        temporary.write_bytes(content)
        extract_history(temporary)
        temporary.replace(history_path)
    history = extract_history(history_path)
    output = ROOT / "src" / "data" / "history.json"
    output.write_text(json.dumps({"units": "NZD millions", "releases": releases, "historical": history}, indent=2) + "\n")
    print(f"Imported {len(history['years'])} historical years, 1972–2025")
    print(f"Validated and wrote {sum(len(r['years']) for r in releases)} year snapshots from {len(releases)} Treasury publications")


if __name__ == "__main__":
    main()
