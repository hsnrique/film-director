# /// script
# requires-python = ">=3.10"
# dependencies = ["mido==1.3.3", "numpy==2.2.6"]
# ///
"""uv run <skill>/scripts/compose_test.py"""
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from compose import build_midi, landmarks, level_at, note_number, parse_chord, voice_lead  # noqa: E402

SCORE = {
    "duration": 12,
    "chords": [{"at": 1.5, "chord": "Dm"}, {"at": 5, "chord": "Bbmaj7"}, {"at": 9, "chord": "F/A"}],
    "dynamics": [[0, 0.1], [8, 0.9], [12, 0.3]],
    "sections": [{"from": 0, "to": 12, "parts": ["piano", "strings", "cello"]}],
    "melody": [{"at": 6, "note": "A4", "dur": 2}],
}


def test_chords():
    assert parse_chord("Dm") == (2, (0, 3, 7), 2)
    assert parse_chord("Bbmaj7") == (10, (0, 4, 7, 11), 10)
    assert parse_chord("F/A") == (5, (0, 4, 7), 9)
    assert note_number("A4") == 69 and note_number("Bb3") == 58
    try:
        parse_chord("Dx")
        raise AssertionError("unknown quality must fail")
    except ValueError:
        pass


def test_voice_leading_moves_little():
    dm = voice_lead([], {2, 5, 9})
    bb = voice_lead(dm, {10, 2, 5, 9})
    assert {n % 12 for n in dm} == {2, 5, 9}
    assert {n % 12 for n in bb} >= {10}
    assert sum(abs(a - b) for a, b in zip(dm, bb)) <= 6, (dm, bb)


def test_dynamics_are_smooth_and_bounded():
    keys = SCORE["dynamics"]
    assert level_at(keys, 0) == 0.1 and level_at(keys, 8) == 0.9 and level_at(keys, 40) == 0.3
    assert abs(level_at(keys, 4) - 0.5) < 1e-9
    assert level_at(keys, 0.5) < level_at(keys, 1.0)


def test_notes_land_on_the_cues():
    midi = build_midi(SCORE)
    clock, onsets = 0, []
    for msg in midi.tracks[0]:
        clock += msg.time
        if msg.type == "note_on":
            onsets.append(clock / 960)
    assert abs(min(onsets) - 1.5) < 1e-3
    assert any(abs(t - 5) < 1e-3 for t in onsets) and any(abs(t - 9) < 1e-3 for t in onsets)
    assert landmarks(SCORE)["first_note"] == 1.5 and landmarks(SCORE)["final_chord"] == 9
    assert abs(landmarks(SCORE)["peak"] - 8) < 0.06


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
