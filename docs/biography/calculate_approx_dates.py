"""
Calculate approximate birth and death years from the Birth and Death Dates tab

The script will write a three-column CSV:
    UO_ID, approxBirth, approxDeath

Usage, from docs/biography:
    python calculate_approx_dates.py
    python calculate_approx_dates.py "path/to/xlsx/file.xlsx"
    python calculate_approx_dates.py input.xlsx output.csv
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path
from typing import Any

import pandas as pd


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = SCRIPT_DIR / "csv" / "Chronographics Biographies(6_8_2026).xlsx" # change to most recent data download
DEFAULT_OUTPUT = SCRIPT_DIR / "csv" / "approx_birth_death_dates.csv"
SHEET_NAME = "Birth and Death Dates"

# we previously used 45 years as our estimate for life length when Priestly left them unknown
# currently we now use 60 years. change the following var to the estimated lifelength for unknowns
DEFAULT_UNKNOWN_LIFE_LENGTH = 60


def is_blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    return False


def as_year(value: Any) -> int | None:
    if is_blank(value):
        return None
    try:
        return int(round(float(value)))
    except (TypeError, ValueError):
        return None


def clean_uo_id(value: Any) -> str | None:
    if is_blank(value):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value).strip()

    if math.isnan(number):
        return None
    if number.is_integer():
        return str(int(number))
    return f"{number:g}"


def clean_code(value: Any) -> str:
    if is_blank(value):
        return ""
    return " ".join(str(value).strip().split()).lower()


def known_life_length(row: pd.Series) -> int | None:
    life_length = as_year(row.get("LifeLength"))
    if life_length is not None and life_length > 0:
        return life_length
    return None


def inferred_life_length(row: pd.Series) -> int:
    return known_life_length(row) or DEFAULT_UNKNOWN_LIFE_LENGTH


def calculate_row(row: pd.Series) -> tuple[int | None, int | None, str | None]:
    code = clean_code(row.get("Index Life Code"))
    birth = as_year(row.get("BirthDate"))
    death = as_year(row.get("DeathDate"))
    alive = as_year(row.get("AliveDate"))
    existing_approx_birth = as_year(row.get("approxBirthDate"))
    existing_approx_death = as_year(row.get("approxDeathDate"))
    life_length = inferred_life_length(row)
    exact_life_length = known_life_length(row)

    # if Priestley's index gives an explicit
    # lifespan, do not change the sheet's existing approximate dates. The 45 ->
    # 60 update is meant only for rows whose lifespan is unknown/blank.
    if exact_life_length is not None:
        return existing_approx_birth, existing_approx_death, None

    if code in {"fl.", "liv.", "fl. af.", "fl. ab.", "liv. af.", "d. fl."}:
        if alive is None:
            return None, None, "missing AliveDate"
        return alive - 40, alive + 20, None

    if code in {"fl. (ll)", "liv. (ll)"}:
        if alive is None:
            return None, None, "missing AliveDate"
        if exact_life_length is not None:
            return alive - exact_life_length, alive, None
        return alive - 40, alive + 20, None

    if code in {"d.", "do. d.", "d. ab."}:
        if death is None:
            return None, None, "missing DeathDate"
        return death - DEFAULT_UNKNOWN_LIFE_LENGTH, death, None

    if code == "d. af.":
        if death is None:
            return None, None, "missing DeathDate"
        return death - (DEFAULT_UNKNOWN_LIFE_LENGTH - 5), death + 5, None

    if code in {
        "d. (ll)",
        "d. ab. (ll)",
        "d. (ll) ab.",
        "d. ab. (ll) ab.",
        "d. (ll) above",
    }:
        if death is None:
            return None, None, "missing DeathDate"
        return death - life_length, death, None

    if code in {"d. af. (ll)", "d. af. (ll) ab."}:
        if death is None:
            return None, None, "missing DeathDate"
        return death - life_length, death + 1, None

    # Birth-only cases. Blank LifeLength now means an approximate 60-year life.
    if code in {"b.", "b. ab."}:
        if birth is None:
            return None, None, "missing BirthDate"
        return birth, birth + DEFAULT_UNKNOWN_LIFE_LENGTH, None

    if code in {"b. (ll) ab.", "b. (ll) above"}:
        if birth is None:
            return None, None, "missing BirthDate"
        return birth, birth + life_length, None

    if code in {"b. liv. af.", "b. ab. liv. af."}:
        if birth is None:
            return None, None, "missing BirthDate"
        if alive is not None:
            return birth, alive + 20, None
        return birth, birth + life_length, "missing AliveDate; used lifespan fallback"

    if code == "d. af. b.":
        if birth is None:
            return None, None, "missing BirthDate"
        if death is None:
            return birth, birth + life_length, "missing DeathDate; used lifespan fallback"
        return birth, death + 1, None

    if birth is not None and death is not None:
        return birth, death, f"unmapped Index Life Code: {code or 'blank'}"
    if death is not None:
        return death - life_length, death, f"unmapped Index Life Code: {code or 'blank'}"
    if birth is not None:
        return birth, birth + life_length, f"unmapped Index Life Code: {code or 'blank'}"
    if alive is not None:
        return alive - 40, alive + 20, f"unmapped Index Life Code: {code or 'blank'}"
    return None, None, f"unmapped Index Life Code: {code or 'blank'}"


def calculate(input_path: Path, output_path: Path) -> pd.DataFrame:
    df = pd.read_excel(input_path, sheet_name=SHEET_NAME)

    rows: list[dict[str, int | None]] = []
    warnings: list[str] = []

    for index, row in df.iterrows():
        uo_id = clean_uo_id(row.get("UO_ID"))
        if uo_id is None:
            continue

        approx_birth, approx_death, warning = calculate_row(row)
        rows.append(
            {
                "UO_ID": uo_id,
                "approxBirth": approx_birth,
                "approxDeath": approx_death,
            }
        )

        if warning:
            warnings.append(f"row {index + 2}, UO_ID {uo_id}: {warning}")

    output = pd.DataFrame(rows, columns=["UO_ID", "approxBirth", "approxDeath"])
    for column in ("approxBirth", "approxDeath"):
        output[column] = output[column].map(lambda value: "" if is_blank(value) else str(int(value)))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.to_csv(output_path, index=False, encoding="utf-8")

    print(f"Input:  {input_path}")
    print(f"Sheet:  {SHEET_NAME}")
    print(f"Rows:   {len(output)}")
    print(f"Output: {output_path}")

    if warnings:
        print()
        print(f"Warnings: {len(warnings)}")
        for warning in warnings[:25]:
            print(f"  - {warning}")
        if len(warnings) > 25:
            print(f"  - ... {len(warnings) - 25} more")

    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Calculate UO_ID, approxBirth, approxDeath from a Chronographics biography workbook."
    )
    parser.add_argument(
        "input",
        nargs="?",
        default=str(DEFAULT_INPUT),
        help=f"Input workbook path. Default: {DEFAULT_INPUT}",
    )
    parser.add_argument(
        "output",
        nargs="?",
        default=str(DEFAULT_OUTPUT),
        help=f"Output CSV path. Default: {DEFAULT_OUTPUT}",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Input workbook not found: {input_path}", file=sys.stderr)
        return 1

    calculate(input_path, output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
