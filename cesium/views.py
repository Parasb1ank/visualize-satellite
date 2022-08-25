from django.shortcuts import HttpResponseRedirect, render
from satellite_czml import satellite_czml
import requests


def sat(request,sat_id):
    data = requests.api.get(f'https://celestrak.org/NORAD/elements/gp.php?CATNR={sat_id}').text
    data = data.splitlines()
    data = [ d.strip() for d in data]


    return render(request, 'current_position.html', { "line1": data[1], "line2": data[2],"sat_name": data[0]  })


def visualize(request,sat_id):

    data = requests.api.get(f'https://celestrak.org/NORAD/elements/gp.php?CATNR={sat_id}').text
    data = data.splitlines()
    data = [ d.strip() for d in data]

    single_tle_list = [ data ]

    czml_string = satellite_czml(tle_list=single_tle_list).get_czml()
    open("cesium/static/data.czml",'w').write(czml_string)

    return render(request, 'visualize.html',{ "sat_id": sat_id } )

