from django.urls import path
from . import views

urlpatterns = [
    path("visualize/<int:sat_id>/",views.visualize ),
    path("<int:sat_id>/",views.sat,name="detail"),
              ]
