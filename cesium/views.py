from django.shortcuts import HttpResponseRedirect, render
from satellite_czml import satellite_czml
import requests


def sat(request,sat_id):
    data = requests.api.get(f'https://celestark.herokuapp.com/tlebyid/{sat_id}').json()


    return render(request, 'current_position.html', { "line1": data["line1"], "line2": data["line2"],"sat_name": data["name"]  })


def visualize(request,sat_id):

    data = requests.api.get(f'https://celestark.herokuapp.com/tlebyid/{sat_id}').json()

    single_tle_list = [ [data["name"],data["line1"], data["line2"]  ] ]

    czml_string = satellite_czml(tle_list=single_tle_list).get_czml()
    open("cesium/static/data.czml",'w').write(czml_string)

    return render(request, 'visualize.html',{ "sat_id": sat_id } )

