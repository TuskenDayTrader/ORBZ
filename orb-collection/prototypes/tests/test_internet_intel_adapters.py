#!/usr/bin/env python3
import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "internet_intel"))

from adapters import parse_json_payload, parse_rss_items, parse_web_page_snippets  # noqa: E402


class AdapterParsingTests(unittest.TestCase):
    def test_parse_rss_items(self):
        rss = """
        <rss><channel>
          <item><title>A</title><link>https://x/a</link><pubDate>2026</pubDate><description>Alpha</description></item>
          <item><title>B</title><link>https://x/b</link><pubDate>2026</pubDate><description>Beta</description></item>
        </channel></rss>
        """
        items = parse_rss_items(rss, limit=1)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["title"], "A")

    def test_parse_json_payload(self):
        payload = '{"data": [{"headline": "one"}, {"headline": "two"}]}'
        items = parse_json_payload(payload, path="data", limit=2)
        self.assertEqual(len(items), 2)
        self.assertEqual(items[1]["headline"], "two")

    def test_parse_web_page_snippets(self):
        html = "<html><body><p>This is a sufficiently long snippet for parsing and validation tests.</p></body></html>"
        snippets = parse_web_page_snippets(html, limit=3)
        self.assertGreaterEqual(len(snippets), 1)
        self.assertIn("snippet", snippets[0])


if __name__ == "__main__":
    unittest.main()
