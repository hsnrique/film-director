# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy==2.2.6"]
# ///
"""uv run <skill>/scripts/listen_test.py"""
import pathlib
import sys

import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from listen import RATE, curve, moment_report, onsets, silences  # noqa: E402


def tone(seconds, level):
    t = np.arange(int(seconds * RATE)) / RATE
    return (np.sin(2 * np.pi * 220 * t) * level).astype(np.float32)


# 2 s of silence, 3 s quiet, a 0.5 s dip, then a loud hit: the shape of a film's payoff.
SIGNAL = np.concatenate([np.zeros(2 * RATE, np.float32), tone(3, 0.05), tone(0.5, 0.004), tone(2, 0.5)])


def test_curve_follows_level():
    levels = curve(SIGNAL)
    assert levels[0] < -100 and abs(levels[5] - (-29.0)) < 1.0 and abs(levels[-1] - (-9.0)) < 1.0


def test_silence_is_found_including_the_dip_before_the_hit():
    assert silences(curve(SIGNAL)) == [[0.0, 2.0], [5.0, 5.5]]


def test_payoff_shows_dip_and_lift():
    report = moment_report(curve(SIGNAL), 5.5)
    assert report["lift_db"] > 20, report


def test_onsets_catch_the_entrances():
    hits = onsets(SIGNAL)
    assert any(abs(h - 2.0) < 0.05 for h in hits) and any(abs(h - 5.5) < 0.05 for h in hits), hits


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
