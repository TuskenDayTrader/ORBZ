#!/usr/bin/env python3
import json
import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "internet_intel"))

from schema_validation import validate_internet_batch  # noqa: E402


class SchemaValidationTests(unittest.TestCase):
    def setUp(self):
        repo = Path(__file__).resolve().parents[3]
        sample_path = repo / "data/internet-intel/normalized/internet-intelligence-batch-v1.json"
        self.sample = json.loads(sample_path.read_text(encoding="utf-8"))

    def test_sample_batch_validates(self):
        errors = validate_internet_batch(self.sample)
        self.assertEqual(errors, [])

    def test_missing_provenance_is_rejected(self):
        broken = json.loads(json.dumps(self.sample))
        del broken["insights"][0]["provenance"]["source_url"]
        errors = validate_internet_batch(broken)
        self.assertTrue(any("source_url" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
