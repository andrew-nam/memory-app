from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from nltk.corpus import wordnet as wn
from random import sample

wordList = list(set(i for i in wn.words()))

@api_view()
def random_words(request):
    defaultCount = 4
    minCount = 1
    maxCount = 10
    count = request.query_params.get('count')
    if count != None:
        try:
            count = int(request.query_params.get('count'))
        except ValueError:
            count = defaultCount
    else:
        count = defaultCount
    if count < minCount :
        count = minCount
    elif count > maxCount :
        count = maxCount
    return Response(sample(wordList, count))

#s.isalpha() 

# Create your views here.
