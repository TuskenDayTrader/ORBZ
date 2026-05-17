#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LEARNING_DIR="${REPO_ROOT}/orb-collection/learning"
SOURCE_MD="${LEARNING_DIR}/course-manuscript.md"
DIST_DIR="${LEARNING_DIR}/dist"
OUTPUT_PDF="${DIST_DIR}/orb-course-v1.pdf"

mkdir -p "${DIST_DIR}"

if command -v pandoc >/dev/null 2>&1; then
  pandoc \
    "${SOURCE_MD}" \
    --from markdown \
    --toc \
    --output "${OUTPUT_PDF}"
  echo "PDF generated with pandoc: ${OUTPUT_PDF}"
  exit 0
fi

python3 "${LEARNING_DIR}/export_pdf.py" "${SOURCE_MD}" "${OUTPUT_PDF}"
echo "PDF generated with python fallback: ${OUTPUT_PDF}"
