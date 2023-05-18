import logging

from celery import current_task
import structlog

from nautobot.core.celery.encoders import NautobotKombuJSONEncoder


structlog.configure(
    processors=[
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.CallsiteParameterAdder(
            {
                structlog.processors.CallsiteParameter.PATHNAME,
                structlog.processors.CallsiteParameter.FUNC_NAME,
                structlog.processors.CallsiteParameter.LINENO,
            }
        ),
        structlog.processors.JSONRenderer(cls=NautobotKombuJSONEncoder, ensure_ascii=False, default=None),
    ],
    cache_logger_on_first_use=True,
)


class NautobotLogHandler(logging.Handler):
    """Custom logging handler to log messages to JobLogEntry database entries."""

    def handle(self, record):
        if current_task is None:
            return

        from nautobot.extras.models.jobs import JobLogEntry, JobResult

        if not JobResult.objects.filter(id=record.task_id).exists():
            return

        JobLogEntry.objects.create(
            job_result_id=record.task_id, log_level=record.levelname.lower(), message=record.message
        )
