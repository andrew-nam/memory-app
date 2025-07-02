from django.urls import path
from memory_app import views

urlpatterns = [
    path('api/random-words/', views.random_words),
    path('api/speech-token/', views.speech_token),
]