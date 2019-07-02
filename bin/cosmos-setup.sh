#!/usr/bin/env bash

source ./bin/env.sh

echo Creating resource group...
az group create --name $GROUP --location $LOCATION

echo Creating Cosmos DB account...
az cosmosdb create --name $COSMOS_NAME --resource-group $GROUP --kind MongoDB

echo Retrieving key...
key=$(az cosmosdb list-keys --name $COSMOS_NAME --resource-group $GROUP --query "primaryMasterKey" | sed -e 's/^"//' -e 's/"$//')

url="mongodb://$COSMOS_NAME:$key@$COSMOS_NAME.documents.azure.com:10255/blogo?ssl=true&sslverifycertificate=false"
echo Database URL:
echo $url
