enum Incomes {
  median = 56_160,
  average = 58_836,
  minimum = 47_216,
  band1 = 14_000,
  band2 = 48_000,
  band3 = 70_000,
  band4 = 180_000
}

const IncomesContent = {
  "14000": "an income threshold of $14,000.00",
  "180000": "an income threshold of $180,000.00",
  "47216": "a minimum wage income of $47,216.00",
  "48000": "an income threshold of $48,000.00",
  "56160": "a median income of $56,160.00",
  "58836": "an average income of $58,836.00",
  "70000": "an income threshold of $70,000.00",
}

export { Incomes as Incomes2022, IncomesContent as IncomesContent2022 };