from django.shortcuts import HttpResponseRedirect, render
from .models import Satellite
from satellite_czml import satellite_czml
import requests


def form(request,sat_id):
    data = requests.api.get(f"https://tle-backend.herokuapp.com/tlebyid/{sat_id}/").json()
    sat_rec = Satellite(id=f"{sat_id}",name=data["name"],line1=data["line1"],line2=data["line2"])
    sat_rec.save()

    return HttpResponseRedirect(f"/cesium/visualize/{sat_id}")

def sat(request,sat_id):
    satrec = Satellite.objects.get(id=f'{sat_id}')

    return render(request, 'current_position.html', { "line1": satrec.line1, "line2": satrec.line2,"sat_name": satrec.name  })

def satellites(request):
    sats = Satellite.objects.all()

    return render(request, 'sat.html', { "sats" :sats  })

def visualize(request,sat_id):
    
    data = requests.api.get(f"https://tle-backend.herokuapp.com/tlebyid/{sat_id}/").json()
    sat_rec = Satellite(id=f"{sat_id}",name=data["name"],line1=data["line1"],line2=data["line2"])
    sat_rec.save()

    sat = Satellite.objects.get(id=f"{sat_id}")
    single_tle_list = [[ sat.name,sat.line1,sat.line2, ]]

    czml_string = satellite_czml(tle_list=single_tle_list).get_czml()
    open("cesium/static/data.czml",'w').write(czml_string)

    return render(request, 'visualize.html',{ "sat_id": sat_id} )

