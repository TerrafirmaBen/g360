from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the map index. This is where the main g360 map page is going to be.")