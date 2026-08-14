#!/usr/bin/env python3
"""Locale profiles for regional Gen-1 manifest generation.

The Gen1Recomp extractors are structural: they parse RGBDS tables whose shape
is identical in every localised pret-style tree.  A small number of *content*
cross-checks are not structural - they quote English strings on purpose, to
catch a silent mis-parse.  Rather than deleting those checks for a French
build (which would let a real regression through), each locale declares what
the check should expect.

Adding ES / DE / IT later means adding an entry here, nothing else.
"""

from __future__ import annotations


LOCALES = {
    "en": {
        "id": "en",
        "language": "en",
        # gfx/credits/the_end.png is one 8x16 column per character of this
        # string, left to right.
        "theEndLetters": "THEND",
        # TheEndTextString laid out across the screen columns.
        "theEndDisplay": "T H E  E N D",
        # data/credits/credits_text.asm CredVersion, as the credits parser
        # renders it into screens[0].lines[1].
        "creditsBanner": {
            "red": "RED VERSION STAFF",
            "blue": "BLUE VERSION STAFF",
        },
        # data/credits/credits_order.asm screen count.
        "creditsScreens": 35,
    },
    "fr": {
        "id": "fr",
        "language": "fr",
        # French caption is "FIN": F, right half of I, left half of I, N.
        # The two I columns are adjacent on screen and join into one glyph.
        "theEndLetters": "FIIN",
        "theEndDisplay": "F II N",
        "creditsBanner": {
            "red": "VERSION ROUGE",
            "blue": "VERSION BLEUE",
        },
        # The French release adds its European localisation staff screens
        # and drops one English screen.
        "creditsScreens": 34,
    },
}


def profile(locale_id):
    try:
        return LOCALES[locale_id]
    except KeyError:
        raise SystemExit(
            f"unknown locale {locale_id!r}; known: {', '.join(sorted(LOCALES))}")


def extract_locale(locale_id):
    """The subset consumed by `extract.util.LOCALE`."""
    spec = profile(locale_id)
    return {
        "id": spec["id"],
        "theEndLetters": spec["theEndLetters"],
        "theEndDisplay": spec["theEndDisplay"],
        # field_metadata() parses the tree with _RED defined.
        "creditsBanner": spec["creditsBanner"]["red"],
        "creditsScreens": spec["creditsScreens"],
    }
