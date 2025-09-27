# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # Es buena práctica nombrar todas tus URLs
    path('about/', views.about, name='about'),
    path('rooms/', views.rooms, name='rooms'),
    path('tourism/', views.tourism, name='tourism'),
    path('reservations/', views.reservations, name='reservations'), # <--- AÑADE ESTE NOMBRE
    path('contact/', views.contact, name='contact'),
    path('gallery/', views.gallery, name='gallery'),
]