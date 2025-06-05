from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from nltk.corpus import wordnet as wn
from random import sample

wordList = list(set(i for i in wn.words()))

@api_view()
def random_words(request):
    return Response(sample(wordList, 4))

#s.isalpha() 

# Create your views here.
