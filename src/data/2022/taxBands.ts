import type { TaxBand } from "../../types";

const taxBands: TaxBand[] = [
  {
    id: "band1",
    end: 14000,
    rate: 10.5
  },
  {
    id: "band2",
    end: 48000,
    rate: 17.5
  },
  {
    id: "band3",
    end: 70000,
    rate: 30
  },
  {
    id: "band4",
    end: 180000,
    rate: 33
  },
  {
    id: "band5",
    end: Number.MAX_VALUE,
    rate: 39
  },
];

export { taxBands as taxBands2022 };