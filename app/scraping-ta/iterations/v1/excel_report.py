from __future__ import annotations

import re
import unicodedata
from collections import defaultdict
from io import BytesIO
from typing import Iterable

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

from schema import ChannelResult, ProductRow

HEADER_FILL = PatternFill("solid", fgColor="1F2937")
HEADER_FONT = Font(color="FFFFFF", bold=True)
WARN_FILL = PatternFill("solid", fgColor="FEE2E2")


def normalize_name(name: str) -> str:
    text = unicodedata.normalize("NFKD", name or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _header(ws, titles: list[str]) -> None:
    ws.append(titles)
    for cell in ws[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(vertical="center")
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(titles))}1"


def _autosize(ws, min_width: int = 12, max_width: int = 48) -> None:
    for col in ws.columns:
        letter = get_column_letter(col[0].column)
        width = min_width
        for cell in col[:80]:
            width = max(width, min(max_width, len(str(cell.value or "")) + 2))
        ws.column_dimensions[letter].width = width


def build_workbook(channels: Iterable[ChannelResult]) -> bytes:
    channels = list(channels)
    rows: list[ProductRow] = [item for ch in channels if not ch.skipped for item in ch.items]

    wb = Workbook()
    resumen = wb.active
    resumen.title = "resumen"
    _header(
        resumen,
        ["platform", "store", "source_url", "native_source", "items", "credits_used", "error"],
    )
    for ch in channels:
        resumen.append(
            [
                ch.platform,
                ch.store,
                ch.source_url,
                ch.native_source,
                0 if ch.skipped else ch.item_count,
                ch.credits_used,
                ch.error or ("omitido" if ch.skipped else ""),
            ]
        )
        if ch.error:
            for cell in resumen[resumen.max_row]:
                cell.fill = WARN_FILL
    _autosize(resumen)

    productos = wb.create_sheet("productos")
    _header(
        productos,
        [
            "platform",
            "store",
            "section",
            "name",
            "description",
            "price_clp",
            "price_original_clp",
            "available",
            "product_id",
            "source_url",
            "scraped_at",
        ],
    )
    for row in rows:
        productos.append(
            [
                row.platform,
                row.store,
                row.section,
                row.name,
                row.description,
                row.price_clp,
                row.price_original_clp,
                row.available,
                row.product_id,
                row.source_url,
                row.scraped_at,
            ]
        )
    _autosize(productos)

    grouped: dict[str, dict[str, ProductRow]] = defaultdict(dict)
    for row in rows:
        key = normalize_name(row.name)
        if not key:
            continue
        grouped[key][row.platform] = row

    comparacion = wb.create_sheet("comparacion")
    _header(
        comparacion,
        [
            "nombre_normalizado",
            "pedidosya_precio",
            "ubereats_precio",
            "rappi_precio",
            "justo_precio",
            "min",
            "max",
            "delta",
            "nombres",
            "locales",
        ],
    )
    for key, by_platform in sorted(grouped.items()):
        if len(by_platform) < 2:
            continue
        prices = {
            platform: row.price_clp
            for platform, row in by_platform.items()
            if row.price_clp is not None
        }
        values = list(prices.values())
        minimum = min(values) if values else None
        maximum = max(values) if values else None
        delta = (maximum - minimum) if minimum is not None and maximum is not None else None
        comparacion.append(
            [
                key,
                prices.get("pedidosya"),
                prices.get("ubereats"),
                prices.get("rappi"),
                prices.get("justo"),
                minimum,
                maximum,
                delta,
                " | ".join(sorted({row.name for row in by_platform.values()})),
                " | ".join(sorted({row.store for row in by_platform.values()})),
            ]
        )
    comparacion.append([])
    comparacion.append(
        [
            "Nota: cruce por nombre normalizado. Solo es auditoría 1:1 si las 4 URLs son del mismo local."
        ]
    )
    _autosize(comparacion, max_width=56)

    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()
