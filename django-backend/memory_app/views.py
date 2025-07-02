from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from nltk.corpus import wordnet as wn
from random import sample
import requests
from os import environ

wordList = list(set(i for i in wn.words()))

@api_view()
def random_words(request):
    defaultCount = 4
    minCount = 1
    maxCount = 10000
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
    return Response(sample(wordList, count), status=200, template_name=None, headers={'Access-Control-Allow-Origin': 'http://127.0.0.1:5173'})

@api_view()
def speech_token(request):
    speechKey = environ['SPEECH_KEY']
    speechRegion = environ['SPEECH_REGION']

    if speechKey == '' or speechRegion == '':
        response = Response('You forgot to add your speech key or region to the .env file.', status=400)
    else:
        headers = {
            'Ocp-Apim-Subscription-Key': speechKey, 
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-length': '0'
            }
        print(f'https://{speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken')
        print(f'{headers}')
        try:
            print('trying to get token')
            tokenResponse = requests.post(f'https://{speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken', headers=headers)
            print('request made')
            response = Response({'token':tokenResponse.text, 'region':speechRegion}, status=200, headers={'Content-Type':'application/json', 
            'Access-Control-Allow-Origin': 'http://127.0.0.1:5173'})
        except Exception as error:
            print('exception encountered: ', error)
            response = Response(data='There was an error authorizing your speech key.', status=401, headers={'Access-Control-Allow-Origin': 'http://127.0.0.1:5173'})

    return response

#s.isalpha() 

# Create your views here.
