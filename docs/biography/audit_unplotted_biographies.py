'''
This script audits which rows in the spreadsheet are not being drawn on the interactive Chart of Biography

Mirrors loadBioData() inclusion rules in priestleyFullBio.js

Usage (from docs/biography):
  python audit_unplotted_biographies.py
  python audit_unplotted_biographies.py "csv/Chronographics Biographies(6_5_2026).csv"

Requires pandas:
  pip install pandas
'''

import sys
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CSV = SCRIPT_DIR / 'csv' / 'Chronographics Biographies(6_5_2026).csv'
DEFAULT_OUTPUT = SCRIPT_DIR / 'csv' / 'unplotted-biographies-report.csv'

# Same toggles as priestleyFullBio.js
CASE_9 = 0
CASE_10 = 0
CASE_12 = 0
BOOL_CASES = [0, 1, 1, 1, 1, 1, 1, 1, 1, CASE_9, CASE_10, 1, CASE_12, 1, 1, 1]

DISABLED_CASE_LABELS = {
    9: 'Case 9 (unsure — not drawn on interactive chart)',
    10: 'Case 10 (unsure2 — not drawn on interactive chart)',
    12: 'Case 12 (no line number — not drawn on interactive chart)',
}

REPORT_COLUMNS = [
    'NameInIndex',
    'UO_ID',
    'NameOnChart',
    'case',
    'VisualCase',
    'OnChartCategory',
    'On Chart: Line #',
    'Index Category 1',
    'reason',
]


def classify_row(row):
    name_in_index = '' if pd.isna(row.get('NameInIndex')) else str(row.get('NameInIndex')).strip()
    name_on_chart = '' if pd.isna(row.get('NameOnChart')) else str(row.get('NameOnChart')).strip()
    case_val = '' if pd.isna(row.get('case')) else str(row.get('case')).strip()
    line_raw = row.get('On Chart: Line #')

    if name_in_index == '' and name_on_chart == '':
        return False, 'Blank spreadsheet row (no index or chart name)'

    test_case = False
    if case_val not in ('', 'none'):
        digits = ''.join(ch for ch in case_val if ch.isdigit())
        if digits:
            test_case = int(digits)

    if case_val in ('', 'none'):
        return False, 'Case missing or set to "none"'

    if test_case >= len(BOOL_CASES) or not BOOL_CASES[test_case]:
        reason = DISABLED_CASE_LABELS.get(
            test_case,
            f'Case {test_case} disabled in chart loader',
        )
        return False, reason

    try:
        line_num = float(line_raw)
    except (TypeError, ValueError):
        line_num = float('nan')

    if not (line_num > 0 and case_val != ''):
        return False, 'No chart placement (On Chart: Line # is missing or zero)'

    return True, 'Plotted on interactive chart'


def audit(input_csv, output_csv):
    input_path = Path(input_csv)
    output_path = Path(output_csv)

    if not input_path.exists():
        raise FileNotFoundError(f'CSV not found: {input_path}')

    df = pd.read_csv(input_path, dtype=str, keep_default_na=False)
    rows = df.to_dict(orient='records')

    unplotted = []
    reason_counts = {}
    plotted = 0

    for row in rows:
        is_plotted, reason = classify_row(row)
        reason_counts[reason] = reason_counts.get(reason, 0) + 1

        if is_plotted:
            plotted += 1
        else:
            unplotted.append({col: row.get(col, '') for col in REPORT_COLUMNS[:-1]} | {'reason': reason})

    report_df = pd.DataFrame(unplotted, columns=REPORT_COLUMNS)
    report_df.to_csv(output_path, index=False, encoding='utf-8')

    print(f'Input CSV:         {input_path}')
    print(f'Total data rows:   {len(rows)}')
    print(f'Plotted on chart:  {plotted}')
    print(f'Not plotted:       {len(unplotted)}')
    print(f'Report written:    {output_path}')
    print('\nBreakdown (all rows):')
    for reason, count in sorted(reason_counts.items(), key=lambda item: item[1], reverse=True):
        print(f'  {count}\t{reason}')


def main():
    input_csv = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV
    if not input_csv.is_absolute():
        input_csv = SCRIPT_DIR / input_csv

    output_csv = input_csv.parent / 'unplotted-biographies-report.csv'
    audit(input_csv, output_csv)


if __name__ == '__main__':
    main()
