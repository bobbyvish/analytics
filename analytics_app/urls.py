from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('index/', views.index, name="index"),
    path('contact/', views.contact, name="contact"),
    path('about/', views.about, name="about"),
    path('pricing/', views.pricing, name="pricing"),
    path('features/', views.features, name="features"),
    
    path('analytics-data/', views.analytics_data, name = "analytics_data"),
    path('dashboard/', views.dashboard, name="dashboard"),
    path('journey/details', views.journey, name="journey"),
    path('page-url/details', views.hit_exit_details, name="hit_exit_details"),
]