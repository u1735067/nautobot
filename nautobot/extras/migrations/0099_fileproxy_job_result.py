# Generated by Django 3.2.22 on 2023-10-27 16:32

from django.db import migrations, models
import django.db.models.deletion
import nautobot.extras.models.models


class Migration(migrations.Migration):
    dependencies = [
        ("extras", "0098_rename_data_jobresult_result"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileproxy",
            name="job_result",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="files",
                to="extras.jobresult",
            ),
        ),
        migrations.AlterField(
            model_name="fileproxy",
            name="file",
            field=models.FileField(
                storage=nautobot.extras.models.models._job_storage, upload_to=nautobot.extras.models.models._upload_to
            ),
        ),
    ]
