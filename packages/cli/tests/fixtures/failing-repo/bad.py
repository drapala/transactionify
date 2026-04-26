"""Deliberately triggers ruff F811 (the canary rule that proves the lint
config catches real violations — see GP-009a validation #22).

Why F811 and not F401: the platform's pyproject.toml ignores F401 globally
(legacy fork source uses unused imports for re-export). F811 (duplicate
definition) is explicitly NOT ignored — that's the rule we use to prove
the config is not 'ignore everything'.
"""

import os  # noqa: F401  — re-export pattern; ignored globally
import os  # F811 — duplicate import; not ignored, so ruff fails here


def add(a, b):
    return a + b
