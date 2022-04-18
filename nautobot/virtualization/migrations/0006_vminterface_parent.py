# Generated by Django 3.2.12 on 2022-04-18 11:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("virtualization", "0005_add_natural_indexing"),
    ]

    operations = [
        migrations.AddField(
            model_name="vminterface",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="child_interfaces",
                to="virtualization.vminterface",
            ),
        ),
    ]
