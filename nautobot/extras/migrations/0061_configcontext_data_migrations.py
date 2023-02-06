# Generated by Django 3.2.16 on 2022-11-25 11:45

from django.db import migrations
from nautobot.extras.utils import migrate_role_data


def migrate_data_from_legacy_role_to_new_role(apps, schema):
    """Copy record from role to temp_role"""

    Role = apps.get_model("extras", "Role")
    ConfigContext = apps.get_model("extras", "ConfigContext")
    migrate_role_data(
        model=ConfigContext,
        role_model=Role,
        legacy_role="legacy_roles",
        new_role="new_roles",
        is_m2m_field=True,
    )


def reverse_role_data_migrate(apps, schema):
    """Reverse changes made to new_role"""
    ConfigContext = apps.get_model("extras", "ConfigContext")
    DeviceRole = apps.get_model("dcim", "DeviceRole")
    migrate_role_data(
        model=ConfigContext,
        role_model=DeviceRole,
        legacy_role="new_roles",
        new_role="legacy_roles",
        is_m2m_field=True,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("extras", "0060_alter_configcontext_and_add_new_role"),
    ]

    operations = [
        migrations.RunPython(migrate_data_from_legacy_role_to_new_role, reverse_role_data_migrate),
    ]
