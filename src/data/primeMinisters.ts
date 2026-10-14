import type { Snapshot } from "../utils/budgetHistory";

export const primeMinisterSource = "https://www3.parliament.nz/en/visit-and-learn/mps-and-parliaments-1854-onwards/prime-ministers-of-new-zealand-since-1856/";

// Substantive prime ministers, using Parliament's appointment dates.
const primeMinisters = [
  { name: "Keith Holyoake", start: "1960-12-12", party: "National" },
  { name: "Jack Marshall", start: "1972-02-07", party: "National" },
  { name: "Norman Kirk", start: "1972-12-08", end: "1974-08-31", party: "Labour" },
  { name: "Bill Rowling", start: "1974-09-06", party: "Labour" },
  { name: "Robert Muldoon", start: "1975-12-12", party: "National" },
  { name: "David Lange", start: "1984-07-26", party: "Labour" },
  { name: "Geoffrey Palmer", start: "1989-08-08", party: "Labour" },
  { name: "Mike Moore", start: "1990-09-04", party: "Labour" },
  { name: "Jim Bolger", start: "1990-11-02", party: "National" },
  { name: "Jenny Shipley", start: "1997-12-08", party: "National" },
  { name: "Helen Clark", start: "1999-12-10", party: "Labour" },
  { name: "John Key", start: "2008-11-19", party: "National" },
  { name: "Bill English", start: "2016-12-12", party: "National" },
  { name: "Jacinda Ardern", start: "2017-10-26", party: "Labour" },
  { name: "Chris Hipkins", start: "2023-01-25", party: "Labour" },
  { name: "Christopher Luxon", start: "2023-11-27", party: "National" },
];

export function primeMinisterSegments(series: Snapshot[]) {
  return primeMinisters.flatMap((pm, index) => {
    const end = pm.end ?? primeMinisters[index + 1]?.start;
    const termStart = Date.parse(pm.start);
    const termEnd = end ? Date.parse(end) : Infinity;
    const overlaps = series.flatMap((year, i) => {
      if (year.status !== "Actual") return [];
      const month = year.yearEndMonth ?? 6;
      // The move from March to June creates a 15-month transition period.
      const startMonth = year.year === 1990 && year.framework ? 3 : month;
      const start = Date.UTC(year.year - 1, startMonth, 1);
      const finish = Date.UTC(year.year, month, 1);
      const a = Math.max(start, termStart), b = Math.min(finish, termEnd);
      return a < b ? [{ from: i + (a - start) / (finish - start), to: i + (b - start) / (finish - start) }] : [];
    });
    return overlaps.length ? [{ ...pm, end, from: overlaps[0].from, to: overlaps[overlaps.length - 1].to }] : [];
  });
}
