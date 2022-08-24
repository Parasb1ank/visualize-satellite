from django.urls import path
from . import views

urlpatterns = [
    path("form/<int:sat_id>/",views.form ),
    path("all/",views.satellites),
    path("visualize/<int:sat_id>/",views.visualize ),
    path("<int:sat_id>/",views.sat,name="detail"),
    path('',views.satellites ),
              ]
