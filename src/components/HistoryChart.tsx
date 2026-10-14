import { useEffect, useRef, useState } from "react";
import { governmentForYear } from "../data/governments";
import type { Snapshot } from "../utils/budgetHistory";
import { methodologyChanges } from "../data/methodology";
import { InfoTip } from "./InfoTip";
import { primeMinisterSegments, primeMinisterSource } from "../data/primeMinisters";

type Point = Snapshot & { value: number | null };

export function HistoryChart({ series, category, measure, unit = "NZ$ millions", perPerson = false }: { series: Point[]; category: string; measure: string; unit?: string; perPerson?: boolean }) {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const active = series.find(y => y.year === activeYear) ?? series[series.length - 1];
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const left = 78, top = 28, height = 280, bottom = top + height;
  const plotWidth = width - left - 24;
  const step = plotWidth / series.length;
  const gap = Math.min(6, step * .2);
  const barWidth = step - gap;
  const labelStride = Math.max(1, Math.ceil(40 / step));
  const values = series.map(y => y.value ?? 0);
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values, 0);
  const scaleY = (value: number) => top + (maximum - value) / (maximum - minimum) * height;
  const zero = scaleY(0);
  const amount = (v: number | null) => v === null ? "Not available" : measure === "share" ? `${v.toFixed(1)}%` : `$${v.toLocaleString("en-NZ", { maximumFractionDigits: 1 })}${perPerson ? " per person" : "m"}`;
  const government = governmentForYear(active.year, active.yearEndMonth, active.status === "Forecast" ? active.publicationYear : undefined);
  const laneEnds: number[] = [];
  const ministers = primeMinisterSegments(series).map(pm => {
    const x = left + pm.from * step;
    const segmentWidth = (pm.to - pm.from) * step;
    const labelWidth = pm.name.length * 6.6;
    const labelX = Math.max(left, Math.min(x + segmentWidth / 2 - labelWidth / 2, width - 24 - labelWidth));
    let lane = laneEnds.findIndex(end => end + 12 < labelX);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = labelX + labelWidth;
    return { ...pm, x, segmentWidth, labelX, lane };
  });
  const timelineY = 438;
  const chartHeight = ministers.length ? timelineY + 38 + laneEnds.length * 24 : 415;

  return <>
    <div className="history-legend" aria-label="Government legend"><span><i className="national" />National-led</span><span><i className="labour" />Labour-led</span><span><i className="transition" />Government changed during year</span></div>
    <p className="history-note">Years run left to right. Hover, focus or tap a bar for details. The full timeline fits this view. Dashed outlines mark forecasts.</p>
    <div ref={container} className="history-chart-scroll" role="region" aria-label="Full spending timeline">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`} aria-label={`${category}, ${measure === "share" ? "share of spending" : unit}, by financial year`} role="group">
        <defs><pattern id="government-transition" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="4" height="8" fill="#2866aa" /><rect x="4" width="4" height="8" fill="#b73b50" /></pattern></defs>
        {[0, 1, 2, 3, 4].map(tick => {
          const value = minimum + (maximum - minimum) * tick / 4;
          const y = scaleY(value);
          return <g key={tick}><line x1={left} y1={y} x2={width - 24} y2={y} stroke="#dedee9" /><text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#55556c">{measure === "share" ? `${value.toFixed(1)}%` : Math.round(value).toLocaleString("en-NZ")}</text></g>;
        })}
        <text x={left} y="14" fontSize="11" fill="#55556c">{measure === "share" ? "% of published total" : unit}</text>
        <line x1={left} y1={zero} x2={width - 24} y2={zero} stroke="#74748c" />
        {methodologyChanges.filter(mark => series.some(y => y.year === mark.year && y.framework)).map((mark) => {
          const x = left + series.findIndex(y => y.year === mark.year) * step;
          return <line key={mark.year} x1={x} x2={x} y1={top} y2={bottom + 8} stroke="#77778b" strokeDasharray="4 4" />;
        })}
        {series.map((year, i) => {
          const gov = governmentForYear(year.year, year.yearEndMonth, year.status === "Forecast" ? year.publicationYear : undefined);
          const x = left + i * step + gap / 2;
          const showLabel = i === 0 || i === series.length - 1 || (i % labelStride === 0 && series.length - 1 - i >= labelStride);
          const y = scaleY(year.value ?? 0);
          const fill = gov.tone === "transition" ? "url(#government-transition)" : gov.tone === "labour" ? "#b73b50" : "#2866aa";
          const description = `${year.year - 1}, year starting; year ended ${year.yearEndMonth === 3 ? "March" : "June"} ${year.year}: ${amount(year.value)}. ${year.status}. ${gov.label}. ${gov.detail}`;
          return <g key={year.year} tabIndex={0} role="button" aria-label={description} onFocus={() => setActiveYear(year.year)} onMouseEnter={() => setActiveYear(year.year)} onClick={() => setActiveYear(year.year)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveYear(year.year); } }} className="history-chart-point">
            <title>{description}</title>
            <rect x={left + i * step} y={top} width={step} height={height} fill="transparent" />
            {year.value !== null ? <rect x={x} y={Math.min(y, zero)} width={barWidth} height={Math.max(1, Math.abs(zero - y))} fill={fill} opacity={year.status === "Forecast" ? .5 : .9} stroke={year.status === "Forecast" ? "#25253b" : "none"} strokeDasharray={year.status === "Forecast" ? "3 2" : undefined} /> : <text x={x + barWidth / 2} y={zero - 8} textAnchor="middle" fontSize="10">N/A</text>}
            <rect x={x} y={bottom + 12} width={barWidth} height={8} fill={fill} />
            {showLabel && <text transform={`translate(${x + barWidth / 2},${bottom + 34}) rotate(-55)`} textAnchor="end" fontSize="11" fill="#44445a">{year.year - 1}{year.status === "Forecast" ? " F" : ""}</text>}
          </g>;
        })}
        {methodologyChanges.filter(mark => series.some(y => y.year === mark.year && y.framework)).map((mark, index) => {
          const x = left + series.findIndex(y => y.year === mark.year) * step;
          return <foreignObject key={mark.year} x={Math.min(x, width - 60)} y={top + (width < 1100 ? index % 3 * 28 : 0)} width="54" height="26" className="methodology-marker"><InfoTip label={String(mark.year)}><strong>{mark.year}: {mark.label}</strong><p>{mark.explanation}</p></InfoTip></foreignObject>;
        })}
        <text x={left + plotWidth / 2} y="401" textAnchor="middle" fontSize="12" fill="#55556c">Financial year starting (F = forecast)</text>
        {ministers.length > 0 && <text x={left} y={timelineY - 10} fontSize="11" fill="#55556c">Prime minister in office</text>}
        {ministers.map(pm => {
          const colour = pm.party === "Labour" ? "#b73b50" : "#2866aa";
          const labelY = timelineY + 32 + pm.lane * 24;
          const description = `${pm.name} · ${pm.party} · ${pm.start} to ${pm.end ?? "ongoing in available actual years"}`;
          return <g key={pm.start} tabIndex={0} aria-label={description}>
            <title>{description}</title>
            <rect x={pm.x} y={timelineY} width={Math.max(.5, pm.segmentWidth)} height={9} fill={colour} stroke="white" strokeWidth=".7" />
            <path d={`M ${pm.x + pm.segmentWidth / 2} ${timelineY + 10} V ${labelY - 12} H ${pm.labelX + 4}`} fill="none" stroke={colour} strokeOpacity=".45" />
            <text x={pm.labelX} y={labelY} fontSize="11" fill={colour}>{pm.name}</text>
          </g>;
        })}
      </svg>
    </div>
    <p className="history-note">Prime minister segments follow appointment dates within each financial year; short terms use staggered labels. Acting appointments are omitted. Forecast years have no prime minister segment. <a href={primeMinisterSource}>Source: New Zealand Parliament</a>.</p>
    <div className="history-chart-detail" aria-live="polite"><strong>{active.year - 1} · {amount(active.value)} · {active.status}</strong><span>{government.label}{active.status === "Forecast" ? " · publishing government, not a prediction" : " · government during financial year"}</span><small>{government.detail}</small><small>{active.framework ?? "Budget publication"} · year ended {active.yearEndMonth === 3 ? "31 March" : "30 June"} {active.year}{active.gstInclusive ? " · GST inclusive" : ""}</small></div>
  </>;
}
