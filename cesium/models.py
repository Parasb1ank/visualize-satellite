from django.db import models
from django.db.models import Model
# Create your models here.
class Satellite(Model):
    id = models.TextField(max_length=50,primary_key=True)
    name = models.TextField(max_length=200)
    line1 = models.TextField(max_length=500)
    line2 = models.TextField(max_length=500)

    def __str__(self):
        return self.name
