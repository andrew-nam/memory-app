from django.urls import path
from memory_app import views

urlpatterns = [
    path('random-words/', views.random_words),
]