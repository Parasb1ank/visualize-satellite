import numpy as np
from django.shortcuts import HttpResponseRedirect, render
from satellite_czml import satellite, satellite_czml
import requests
from skyfield.api import EarthSatellite,load,wgs84

def sat(request,sat_id):
    data = requests.api.get(f'https://celestrak.org/NORAD/elements/gp.php?CATNR={sat_id}').text
    data = data.splitlines()
    data = [ d.strip() for d in data]
    
    ts = load.timescale()
    satellite = EarthSatellite(name=data[0],line1=data[1],line2=data[2],ts=ts)
    t = ts.now()
    geocentric = satellite.at(t)
    lat,lon = wgs84.latlon_of(geocentric)
    return render(request, 'current_position.html', { "line1": data[1], "line2": data[2],"sat_name": data[0],"lat":lat,"lon": lon  })


def visualize(request,sat_id):

    data = requests.api.get(f'https://celestrak.org/NORAD/elements/gp.php?CATNR={sat_id}').text

    data = data.splitlines()
    data = [ d.strip() for d in data]

    single_tle_list = [ data ]

    czml_string = satellite_czml(tle_list=single_tle_list).get_czml()
    open("cesium/static/data.czml",'w').write(czml_string)




    return render(request, 'visualize.html',{ "sat_id": sat_id } )

