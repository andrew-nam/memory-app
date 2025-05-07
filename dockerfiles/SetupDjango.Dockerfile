FROM python:3.13.3-slim-bookworm

WORKDIR /django-setup

RUN python3 -m pip install django

ARG USER_ID

ARG GROUP_ID

RUN adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID user

USER user

ENTRYPOINT ["bash"]
