# Word Recall SPA (WIP)
A single page application intended to assist in rehabilitation of short term memory loss and speech impairment after medical events. Stroke survivors often suffer from cognitive
symptoms that can manifest in changes to memory, word recognition, concentration, and attention. This application takes a cognitive training exercise that usually requires a proctor
and automates it with AI, providing the user with a greater level of autonomy. In this exercise, the application will recite a set of random words. The user must repeat the same words 
in the same order. After each round, results are collected and a new set of random words are played. The difficulty of the rounds can be adjusted via settings to change elements like 
the number of words recited, the number of allowable playbacks,and the speed of the recitation. Results will be gathered and persisted so that the user can track their progress over 
the longterm.

Demo video: <br>
[![Watch the video](https://img.youtube.com/vi/QBUpbKzNjRU/hqdefault.jpg)](https://www.youtube.com/embed/QBUpbKzNjRU)


## Client
**Tech used:** HTML, CSS, TypeScript, Vue<br>
The frontend was programmed with Vue and Typescript to take advantage of a reactive design. Given the intended audience, it was important to emphasize a simple, responsive, and intuitive
UI. The application needs to be clear to use without much distraction. When options are changed (for instance the number of words being quizzed), results are shown, a round ends 
the page can be dynamically updated without requiring refreshes or further navigation. This also provides for a seamless, predictable, and consistent user experience between rounds. 
Microsoft's Azure Speech services are utilized for the speech synthesis and recognition at the core of the application. Further improvements could allow for the exercise to be performed 
in any of the languages supported by Azure Speech SDK.

## Server
**Tech used:** Python, Django<br>
The backend was programmed with the Django framework and python. Django provides support for many important features out of the box. Namely, user authentication and databases, both of
which will be necessary for users to track their own progress over time. After each round the database will persist information like the words recited, the responses, the time between 
responses, etc. Associating these results to user accounts will help users to track progress, identify potential problem areas, and compare against the average. Additional linguistic 
classification and processing from the Natural Language Toolkit could potentially highlight other patterns of impairment.
