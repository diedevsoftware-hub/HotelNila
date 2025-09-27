from django.http import HttpResponse
from django.shortcuts import render


# Create your views here.
def index(request):
    return render(request,'index.html')

def about(request):
    return render(request,'about.html')

def rooms(request):
    return render(request, 'rooms.html')

# views.py
def tourism(request):
    lugares = [
        {
            "nombre": "Cumbemayo",
            "descripcion": "Un sitio arqueológico rodeado de formaciones rocosas únicas y canales preincaicos.",
            "imagen": "image/eligeeNila.jpg"
        },
        {
            "nombre": "Baños del Inca",
            "descripcion": "Aguas termales donde se bañaban los Incas, perfectas para relajarse.",
            "imagen": "image/eligeeNila.jpg"
        },
        {
            "nombre": "Ventanillas de Otuzco",
            "descripcion": "Necrópolis tallada en roca, una muestra impresionante de la cultura Cajamarca.",
            "imagen": "image/eligeeNila.jpg"
        },
        {
            "nombre": "Plaza de Armas",
            "descripcion": "Centro histórico de la ciudad, rodeado de arquitectura colonial y vida local.",
            "imagen": "image/eligeeNila.jpg"
        },
    ]
    return render(request, "tourism.html", {"lugares": lugares})

def reservations(request):
    return render(request, 'reservations.html')

def contact(request):
    return render(request, 'contact.html')

def gallery(request):
    return render(request, 'gallery.html')