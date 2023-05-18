import json
import logging

from django.utils.functional import SimpleLazyObject
from django.utils.module_loading import import_string
from rest_framework.utils.encoders import JSONEncoder

logger = logging.getLogger(__name__)


class NautobotKombuJSONEncoder(JSONEncoder):
    """
    Custom json encoder based on restframework's JSONEncoder that serializes objects that implement
    the `nautobot_serialize()` method via the `__nautobot_type__` interface. This is useful
    in passing special objects to and from Celery tasks.

    This pattern should generally be avoided by passing pointers to persisted objects to the
    Celery tasks and retrieving them from within the task execution. While this is always possible
    for model instances (which covers 99% of use cases), for rare instances where it does not,
    and the actual object must be passed, this pattern allows for encoding and decoding
    of such objects.

    It requires a conforming class to implement the instance method `nautobot_serialize()` which
    returns a json serializable dictionary of the object representation. The class must also implement
    the `nautobot_deserialize()` class method which takes the dictionary representation and returns
    an actual instance of the class.
    """

    def default(self, obj):
        # Import here to avoid django.core.exceptions.ImproperlyConfigured Error.
        # Core App is not set up yet if we import this at the top of the file.
        from nautobot.core.models import BaseModel
        from nautobot.core.models.managers import TagsManager

        if isinstance(obj, BaseModel):
            cls = obj.__class__
            module = cls.__module__
            qual_name = ".".join([module, cls.__qualname__])  # fully qualified dotted import path
            logger.debug("Performing nautobot serialization on %s for type %s", obj, qual_name)
            data = {
                "id": obj.id,
                "__nautobot_type__": qual_name,
                # TODO: change to natural key to provide additional context if object is deleted from the db
                "display": getattr(obj, "display", str(obj)),
            }
            return data

        elif isinstance(obj, set):
            # Convert a set to a list for passing to and from a task
            return list(obj)
        elif isinstance(obj, TagsManager):
            obj = obj.values_list("id", flat=True)
            return obj
        else:
            return super().default(obj)


def nautobot_kombu_json_loads_hook(data):
    """
    In concert with the NautobotKombuJSONEncoder json encoder, this object hook method decodes
    objects that implement the `__nautobot_type__` interface via the `nautobot_deserialize()` class method.
    """
    if "__nautobot_type__" in data:
        qual_name = data.pop("__nautobot_type__")
        logger.debug("Performing nautobot deserialization for type %s", qual_name)
        cls = import_string(qual_name)  # fully qualified dotted import path
        if cls:
            return SimpleLazyObject(lambda: cls.objects.get(id=data["id"]))
        else:
            raise TypeError(f"Unable to import {qual_name} during nautobot deserialization")
    else:
        return data


# Encoder function
def _dumps(obj):
    return json.dumps(obj, cls=NautobotKombuJSONEncoder, ensure_ascii=False)


# Decoder function
def _loads(obj):
    return json.loads(obj, object_hook=nautobot_kombu_json_loads_hook)
