"""Schema validation tests for @golden-path/shared-schemas.

These tests assert *correctness* of validator behavior — distinguishing
"schema correctly rejected" from "tool failed" — which is why we use
pytest assertions rather than shell `&& exit 1 || exit 0` patterns.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError

REPO_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_DIR = REPO_ROOT / "packages" / "shared-schemas"
FIXTURES = SCHEMA_DIR / "tests" / "fixtures"

DORA_SCHEMA = json.loads((SCHEMA_DIR / "dora-event.schema.json").read_text())
DX_CONFIG_SCHEMA = json.loads((SCHEMA_DIR / "dx-config.schema.json").read_text())


def _validator(schema):
    return Draft202012Validator(schema)


def _load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


def _valid_pipeline_run() -> dict:
    return _load_fixture("valid-pipeline-run-event.json")


def _valid_deployment_rework() -> dict:
    return _load_fixture("valid-deployment-rework-event.json")


# ---------------------------------------------------------------------------
# Positive cases
# ---------------------------------------------------------------------------


def test_valid_pipeline_run_event_validates():
    _validator(DORA_SCHEMA).validate(_valid_pipeline_run())


def test_valid_deployment_rework_event_validates():
    _validator(DORA_SCHEMA).validate(_valid_deployment_rework())


def test_valid_minimal_dx_config_validates():
    config = {
        "project": "transactionify",
        "stack": "python",
        "service_shape": "lambda",
    }
    _validator(DX_CONFIG_SCHEMA).validate(config)


def test_valid_dx_config_with_custom_steps():
    config = {
        "project": "transactionify",
        "stack": "python",
        "service_shape": "lambda",
        "custom_steps": [{"name": "e2e", "run": "pytest tests/e2e"}],
    }
    _validator(DX_CONFIG_SCHEMA).validate(config)


# ---------------------------------------------------------------------------
# Negative cases — DORA event
# ---------------------------------------------------------------------------


def test_invalid_missing_finished_at():
    event = _valid_pipeline_run()
    del event["finished_at"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "finished_at" in str(exc.value)


def test_invalid_missing_commit_sha():
    event = _valid_pipeline_run()
    del event["commit_sha"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "commit_sha" in str(exc.value)


def test_invalid_unknown_event_type():
    event = _valid_pipeline_run()
    event["event_type"] = "feature_flag_flip"
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    msg = str(exc.value)
    assert "feature_flag_flip" in msg or "enum" in msg


def test_invalid_incident_event_type_rejected():
    event = _valid_pipeline_run()
    event["event_type"] = "incident_opened"
    with pytest.raises(ValidationError):
        _validator(DORA_SCHEMA).validate(event)


def test_invalid_missing_event_id():
    event = _valid_pipeline_run()
    del event["event_id"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "event_id" in str(exc.value)


def test_invalid_event_id_not_uuidv7():
    event = _valid_pipeline_run()
    # Valid UUIDv4 but invalid UUIDv7 (version nibble is 4, not 7).
    event["event_id"] = "00000000-0000-4000-8000-000000000000"
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "event_id" in str(exc.value) or "pattern" in str(exc.value)


def test_invalid_recovered_from_failure_id_not_uuidv7():
    event = _valid_deployment_rework()
    event["recovered_from_failure_id"] = "not-a-uuid"
    with pytest.raises(ValidationError):
        _validator(DORA_SCHEMA).validate(event)


def test_invalid_missing_actor():
    event = _valid_pipeline_run()
    del event["actor"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "actor" in str(exc.value)


def test_invalid_missing_work_id():
    event = _valid_pipeline_run()
    del event["work_id"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "work_id" in str(exc.value)


def test_invalid_missing_change_summary():
    event = _valid_pipeline_run()
    del event["change_summary"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "change_summary" in str(exc.value)


def test_invalid_ci_source_missing_run_id():
    event = _valid_pipeline_run()
    assert event.get("source") == "ci"
    del event["run_id"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "run_id" in str(exc.value)


def test_invalid_ci_source_missing_source_url():
    event = _valid_pipeline_run()
    del event["source_url"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "source_url" in str(exc.value)


def test_invalid_deployment_missing_commit_authored_at():
    event = _valid_deployment_rework()
    del event["commit_authored_at"]
    with pytest.raises(ValidationError) as exc:
        _validator(DORA_SCHEMA).validate(event)
    assert "commit_authored_at" in str(exc.value)


def test_invalid_additional_property_rejected():
    event = _valid_pipeline_run()
    event["deployment_frequency_per_week"] = 42  # category error: aggregated metric on a single event
    with pytest.raises(ValidationError):
        _validator(DORA_SCHEMA).validate(event)


def test_invalid_work_id_pattern():
    event = _valid_pipeline_run()
    event["work_id"] = "JIRA-123"
    with pytest.raises(ValidationError):
        _validator(DORA_SCHEMA).validate(event)


# ---------------------------------------------------------------------------
# Negative cases — dx-config
# ---------------------------------------------------------------------------


def test_invalid_dx_config_unknown_service_shape():
    config = {
        "project": "x",
        "stack": "python",
        "service_shape": "container",  # not in enum
    }
    with pytest.raises(ValidationError) as exc:
        _validator(DX_CONFIG_SCHEMA).validate(config)
    assert "service_shape" in str(exc.value) or "container" in str(exc.value)


def test_invalid_dx_config_missing_service_shape():
    config = {"project": "x", "stack": "python"}
    with pytest.raises(ValidationError) as exc:
        _validator(DX_CONFIG_SCHEMA).validate(config)
    assert "service_shape" in str(exc.value)


def test_invalid_dx_config_unknown_stack():
    config = {"project": "x", "stack": "rust", "service_shape": "binary"}
    with pytest.raises(ValidationError):
        _validator(DX_CONFIG_SCHEMA).validate(config)


def test_invalid_custom_step_missing_run():
    config = {
        "project": "x",
        "stack": "python",
        "service_shape": "lambda",
        "custom_steps": [{"name": "e2e"}],
    }
    with pytest.raises(ValidationError) as exc:
        _validator(DX_CONFIG_SCHEMA).validate(config)
    assert "run" in str(exc.value)
