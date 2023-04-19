import pstats

from nautobot.core.celery import register_jobs
from nautobot.extras.jobs import Job


class TestProfilingJob(Job):
    """
    Job to have profiling tested.
    """

    description = "Test profiling"

    def run(self):
        """
        Job function.
        """

        self.log_success(obj=None, message="Profiling test.")

        return []

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        super().after_return(status, retval, task_id, args, kwargs, einfo=einfo)
        pstats.Stats(f"/tmp/nautobot-jobresult-{self.job_result.id}.pstats")


register_jobs(TestProfilingJob)
