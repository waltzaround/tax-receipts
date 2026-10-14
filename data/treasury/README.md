# Treasury budget history

## Inflation and population

Run `python3 scripts/import-adjustments.py` to rebuild `src/data/adjustments.json`
from the archived `cpi-index.csv` and `population-world-bank.json`. Source URLs
and SHA-256 checksums are saved in the output. The importer uses Stats NZ's
all-groups quarterly CPI (`CPIQ.SE9A`, June 2025 release) and World Bank annual
population (`SP.POP.TOTL`, API last updated 2026-10-08).

For each financial year, CPI is the mean of its four quarterly indices:
June/September/December/March for March years, or September/December/March/June
for June years. The fixed reference is the year ended June 2025 (CPI 1293.0).
Adjusted amount = nominal amount × 1293.0 / fiscal-year CPI.

Per person = nominal NZD millions × 1,000,000 / annual population. Population
is the ending calendar year's World Bank estimate (a mid-year proxy, not a
fiscal-year average). Both options may be combined. CPI measures consumer
prices, not the cost of producing government services. Data cover 1972–2025;
missing denominators produce N/A, never extrapolation or unlabelled nominal
fallback. Forecast amounts within coverage are restated using observed
denominators, not their original forecast assumptions. Shares use nominal
numerators and totals because a common adjustment cancels out.

The UI applies the selected range to the chart, and adjustments to chart
amounts, comparison cards, category amounts/changes, and CSV. Reset restores
full history, the full date range, nominal totals and the default category.

## Full historical series

`fiscal-time-series-1972-2025.xlsx` is Treasury's January 2026 release:
https://www.treasury.govt.nz/sites/default/files/2026-01/fiscaltimeseries1972-2025-year-end25.xlsx

The importer reads `Spending!B5:Q58`, retaining all 54 years. It uses financial
net expenditure (column C) before 1994 and Core Crown expenses (column D)
from 1994. Category values come from columns G:Q, with combined source
categories preserved and labels cleaned for display. Blank cells remain
unavailable, never zero. A separately labelled reconciliation difference
preserves discrepancies between category sums and published totals; it must
not be interpreted as an additional Treasury spending category. Original
numeric precision is rounded to six decimal places in the JSON; the UI
shows at most one decimal place in NZD millions.

Fiscal years end in March through 1989 and June thereafter. Cash values in
1987–1993 include GST. Old GAAP (1994–1996), IFRS (1997–2004) and PBE
(2005 onward) have different reporting bases, not a fully backdated series.
The page flags these breaks. See the workbook's Series Descriptions sheet
and https://www.treasury.govt.nz/publications/information-release/data-fiscal-time-series-historical-fiscal-indicators.

1972 is the earliest year in Treasury's published historical fiscal dataset.
The Budget archive itself stops at 1997; Treasury says earlier Budget
documents are available through libraries. The full-history view is actual
expenditure, not reconstructed original Budget forecasts for 1972–2025.

Government dates and party groupings are in `src/data/governments.ts`, sourced
from Parliament's government list (linked in the file and UI). Labels include
all administrations overlapping each financial year. Chart colours use the
prime minister's party, with split colours for changes of leading party.
Detail labels include supporting parties, not only formal coalition partners.
Forecasts are attributed to their publishing government, never a prediction
of the party that will hold office in a future year.

## Budget publication snapshots

The original 2024, 2025 and 2026 Budget Economic and Fiscal Update expense
workbooks are archived here. Their official URLs and SHA-256 checksums are
included in `src/data/history.json`. Source: The Treasury, Crown copyright,
CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).

`scripts/import-treasury.py` reads the first summary table in the
`Core Crown Expense Tables` sheet, preserving all 17 categories, signed
adjustments, fiscal years, actual/forecast status and published totals.
Amounts are NZD millions; fiscal years end on 30 June. The importer rejects
missing numeric cells, unknown statuses, changed category counts and any
failure of category amounts to sum exactly to the published total.

Rebuild with Python 3 and openpyxl installed:

```sh
python3 scripts/import-treasury.py
```

Add `--download` to fetch fresh copies from the official URLs. Review changes
before committing, including checksum changes. To add publications, extend
`SOURCES`, archive their workbooks, rerun the importer and update the page's
coverage/import-date text. The app needs no Python or network access at runtime.

The detailed actuals series chooses the latest actual observation among these
publications for each year (2019–2025). It does not imply these are the most
recent figures across all Treasury releases. Publication views preserve all
ten original year columns, including forecasts. Comparisons are nominal,
not inflation- or population-adjusted. Classifications can change between
publications, and differences are not solely new policy decisions.

Run the data and comparison checks with `node --test scripts/test-history.mjs`.
Run the application build with `pnpm build`.
