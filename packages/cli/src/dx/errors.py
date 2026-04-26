"""User-facing error taxonomy.

UserFacingError carries:
  - message: short, actionable; what went wrong.
  - fix_hint: imperative one-liner; what the user should do next.
  - exit_code: non-zero; defaults to 1.

Output dispatch (human vs machine) reads these fields uniformly:
  - human  → Rich panel showing message + fix hint, exit non-zero.
  - machine → JSON {status: "error", payload: {message, fix_hint}}, exit non-zero.

Internal/unexpected errors should be left as plain Exception so the user
sees a real traceback (better than a fake "polished" panel hiding a bug).
"""

from __future__ import annotations


class UserFacingError(Exception):
    def __init__(self, message: str, fix_hint: str = "", exit_code: int = 1) -> None:
        super().__init__(message)
        self.message = message
        self.fix_hint = fix_hint
        self.exit_code = exit_code


class WorkIdError(UserFacingError):
    """Raised when a Work ID does not match the platform regex."""


class ConfigError(UserFacingError):
    """Raised when .dx.yaml is missing or invalid."""
