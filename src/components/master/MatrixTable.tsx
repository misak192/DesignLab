/**
 * File: src/components/master/MatrixTable.tsx
 * Description: The decision matrix as a table: styles across, rows down in three groups (Moments, Type, Controls). A cell
 * shows where its design comes from in the lab; lit = chosen by Michal, plain = proposed, grey with "Gap" = nothing suitable
 * yet. Type and hairlines only. On a narrow screen the table scrolls sideways inside its own box, never the page.
 */
import { Fragment } from 'react';
import { MATRIX_COLUMNS, MATRIX_LEFT_OUT, MATRIX_ROWS, cellOf, matrixProgress, type MatrixCell } from '@/lib/master/matrix';

function Cell({ cell }: { cell?: MatrixCell }) {
  if (!cell) {
    return (
      <span aria-label="Not filled" className="text-[0.875rem] text-ink-3">
        —
      </span>
    );
  }
  const colour = cell.status === 'chosen' ? 'text-t1' : cell.status === 'gap' ? 'text-ink-3' : 'text-ink';
  return (
    <span className="flex flex-col gap-1">
      <span className={`text-[0.875rem] font-normal leading-[1.35] ${colour}`}>
        {cell.status === 'gap' && <span className="fw-kicker mr-2 text-[0.75rem] text-ink-3">Gap</span>}
        {cell.from}
      </span>
      {cell.note && <span className="text-[0.8125rem] font-normal leading-[1.35] text-ink-3">{cell.note}</span>}
    </span>
  );
}

export default function MatrixTable() {
  const { total, chosen, proposed, gaps } = matrixProgress();
  const groups = Array.from(new Set(MATRIX_ROWS.map((r) => r.group)));

  return (
    <section aria-labelledby="m-matrix" className="flex flex-col gap-4 border-t border-[var(--rail)] py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="m-matrix" className="fw-kicker text-ink">
          Matrix
        </h2>
        <span className="fw-kicker fw-tabular text-t1">
          {chosen} chosen · {proposed} proposed · {gaps} gaps · {total} cells
        </span>
      </div>
      <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
        Each cell is the lab design a row uses under a style. Plain text is my proposal, grey is a gap in the lab, and a lit cell is
        one you have chosen. Say which you like and it is fixed here; when every cell is chosen, the components are built from it.
        Off, Normal and OTT are the amount and apply to every cell.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="w-[150px] pb-4 pr-4">
                <span className="sr-only">Row</span>
              </th>
              {MATRIX_COLUMNS.map((c) => (
                <th key={c.id} scope="col" className="pb-4 pr-6 align-bottom">
                  <span className="fw-kicker block font-medium text-ink">{c.name}</span>
                  <span className="mt-1 block max-w-[24ch] text-[0.8125rem] font-normal normal-case leading-[1.35] tracking-normal text-ink-3">
                    {c.signature}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group}>
                <tr>
                  <th colSpan={MATRIX_COLUMNS.length + 1} scope="colgroup" className="fw-kicker pb-1 pt-8 text-left font-medium text-t1">
                    {group}
                  </th>
                </tr>
                {MATRIX_ROWS.filter((r) => r.group === group).map((r) => (
                  <tr key={r.id} className="border-t border-[var(--rail)]">
                    <th scope="row" className="py-4 pr-4 text-left align-top">
                      <span className="fw-big text-[1.0625rem] font-light text-ink">{r.name}</span>
                    </th>
                    {MATRIX_COLUMNS.map((c) => (
                      <td key={c.id} className="py-4 pr-6 align-top">
                        <Cell cell={cellOf(r.id, c.id)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h3 className="fw-kicker text-ink-2">Left out of the matrix</h3>
        <ul className="flex flex-col gap-2">
          {MATRIX_LEFT_OUT.map((l) => (
            <li key={l.name} className="grid gap-x-6 sm:grid-cols-[240px_1fr]">
              <span className="text-[0.9375rem] font-normal text-ink">{l.name}</span>
              <span className="text-[0.875rem] font-normal text-ink-3">{l.why}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
