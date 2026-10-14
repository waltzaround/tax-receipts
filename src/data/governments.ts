// Dates and party groupings from the New Zealand Parliament's government list.
// Groupings include supporting parties; they are not all formal coalitions.
export const governmentSource = "https://www3.parliament.nz/en/visit-and-learn/mps-and-parliaments-1854-onwards/governments-in-new-zealand-since-1856/";

export const governments = [
  { start: "1960-12-12", lead: "National", parties: "National" },
  { start: "1972-12-08", lead: "Labour", parties: "Labour" },
  { start: "1975-12-12", lead: "National", parties: "National" },
  { start: "1984-07-26", lead: "Labour", parties: "Labour" },
  { start: "1990-11-02", lead: "National", parties: "National" },
  { start: "1994-09-11", lead: "National", parties: "National / Right of Centre" },
  { start: "1995-08-28", lead: "National", parties: "National" },
  { start: "1996-02-28", lead: "National", parties: "National / United" },
  { start: "1996-12-16", lead: "National", parties: "National / NZ First" },
  { start: "1998-08-26", lead: "National", parties: "National / Mauri Pacific" },
  { start: "1999-12-10", lead: "Labour", parties: "Labour / Alliance" },
  { start: "2002-08-15", lead: "Labour", parties: "Labour / Progressive" },
  { start: "2008-11-19", lead: "National", parties: "National / ACT / United Future / Māori Party" },
  { start: "2017-10-26", lead: "Labour", parties: "Labour / NZ First / Green Party" },
  { start: "2020-11-06", lead: "Labour", parties: "Labour / Green Party" },
  { start: "2023-11-27", lead: "National", parties: "National / ACT / NZ First" },
];

export function governmentForYear(year: number, month = 6, forecastPublication?: number) {
  // Forecast attribution is to the publishing government, not a future election outcome.
  const start = forecastPublication ? `${forecastPublication}-05-01` : `${year - 1}-${month === 3 ? "04" : "07"}-01`;
  const end = forecastPublication ? `${forecastPublication}-06-30` : `${year}-${month === 3 ? "03-31" : "06-30"}`;
  const periods = governments.filter((g, i) => g.start <= end && (governments[i + 1]?.start ?? "9999-12-31") > start);
  const leads = [...new Set(periods.map(g => g.lead))];
  const label = leads.join(" → ");
  return {
    label: forecastPublication ? `Budget ${forecastPublication}: ${label}-led` : label,
    tone: leads.length > 1 ? "transition" : leads[0]?.toLowerCase() ?? "unknown",
    detail: periods.map(g => `${g.parties} (from ${g.start})`).join("; "),
  };
}
