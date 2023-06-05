from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.geoip2 import GeoIP2
from user_agents import parse

import requests

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_geoip_info(ip_address):
    g= GeoIP2()
    try:
        country_data = g.country(ip_address)
        city_data = g.city(ip_address)
        return {
            'country_name': country_data.get("country_name"),
            'country_code': country_data.get("country_code"),
            'city_name':    city_data.get("city"),
            'region' : city_data.get('region'),
            'postal_code':  city_data.get("postal_code"),
            'latitude':     city_data.get("latitude"),
            'longitude':    city_data.get("longitude"),
        }
    except Exception as e:
        print(f"Error retrieving geolocation: {str(e)}")
        return None

class VisitorActivity(models.Model):
    HIT = "HIT"
    EXIT = "EXIT"
    SURF = "SURF"
    page_types = [
        (HIT, "Hit"),
        (SURF,"Surf"),
        (EXIT, "Exit"),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    url = models.CharField(max_length=255)
    duration = models.IntegerField(null=True, blank=True)
    device_type = models.CharField(max_length=255, null=True, blank=True)
    browser = models.CharField(max_length=255, null=True, blank=True)
    os = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    page_type  = models.CharField(choices=page_types, max_length=10,null=True, blank=True )
    # Add more fields as per your requirements

    def save(self, *args, **kwargs):
        if 'request' in kwargs:
            request = kwargs.pop('request')
        else:
            request = None

        user_agent = parse(request.META.get('HTTP_USER_AGENT', '')) if request else None
        self.device_type = user_agent.device.family if user_agent else None
        self.browser = user_agent.browser.family if user_agent else None
        self.os = user_agent.os.family if user_agent else None

        ip_address = get_client_ip(request)
        
        geoip_info = get_geoip_info(ip_address)
        if geoip_info:
            self.city =      geoip_info.get("city")
            self.region =    geoip_info.get("region")
            self.country =   geoip_info.get("country_name")
            self.latitude =  geoip_info.get("latitude")
            self.longitude = geoip_info.get("longitude")
        
        super(VisitorActivity, self).save(*args, **kwargs)

    