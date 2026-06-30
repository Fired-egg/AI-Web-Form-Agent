"""Tests for browser form filling helpers."""

from app.models import FormField
from app.services.browser_executor import (
    _checkbox_should_be_checked,
    _radio_selector_for_value,
)


def test_radio_selector_for_value_uses_matching_option_selector() -> None:
    field = FormField(
        selector="#remote",
        field_type="radio",
        mapped_value="office",
    )
    field.options = [
        {"label": "Remote", "value": "remote", "selector": "#remote"},
        {"label": "Office", "value": "office", "selector": "#office"},
    ]

    assert _radio_selector_for_value(field) == "#office"


def test_radio_selector_for_value_falls_back_to_field_selector() -> None:
    field = FormField(
        selector="#remote",
        field_type="radio",
        mapped_value="hybrid",
    )
    field.options = [
        {"label": "Remote", "value": "remote", "selector": "#remote"},
    ]

    assert _radio_selector_for_value(field) == "#remote"


def test_checkbox_should_be_checked_supports_true_and_false_values() -> None:
    assert _checkbox_should_be_checked("yes") is True
    assert _checkbox_should_be_checked("true") is True
    assert _checkbox_should_be_checked("no") is False
    assert _checkbox_should_be_checked("false") is False
    assert _checkbox_should_be_checked("maybe") is None
