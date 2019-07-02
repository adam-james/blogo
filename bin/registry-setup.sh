#!/usr/bin/env bash

source ./bin/env.sh

echo Creating group...
az group create --name $GROUP --location $LOCATION

echo Creating Azure container registry...
az acr create --resource-group $GROUP --name $REGISTRY --sku Basic

echo Logging into registry...
az acr login --name $REGISTRY

echo Building images...
docker build -t blogo-post-service ./post-service/
docker build -t blogo-upvote-service ./upvote-service/

echo Fetching login server info...
loginServer=$(az acr list --resource-group $GROUP --query "[].{acrLoginServer:loginServer}" --output tsv)

echo Tagging images...
docker tag blogo-post-service $loginServer/blogo-post-service:latest
docker tag blogo-upvote-service $loginServer/blogo-upvote-service:latest

echo Pushing images...
docker push $loginServer/blogo-post-service:latest
docker push $loginServer/blogo-upvote-service:latest
