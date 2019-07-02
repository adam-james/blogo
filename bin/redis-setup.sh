#!/usr/bin/env bash

source ./bin/env.sh

echo Creating a resource group...
az group create --name $GROUP --location $LOCATION

echo Creating a Redis cache...
az redis create --name $CACHE --resource-group $GROUP --location $LOCATION \
  --sku Basic --vm-size C0

echo Fetching Redis config data...
redis=($(az redis show --name $CACHE --resource-group $GROUP \
  --query [hostName,sslPort] --output tsv))

key=$(az redis list-keys --name $CACHE --resource-group $GROUP \
  --query primaryKey --output tsv)

echo Redis port:
echo ${redis[1]}

echo Redis host:
echo ${redis[0]}

echo Redis key:
echo $key
