#!/usr/bin/env bash

source ./bin/env.sh

echo Creating service principal...
principal=($(az ad sp create-for-rbac --skip-assignment \
  --query [appId,password] --output tsv))

appId=${principal[0]}
password=${principal[1]}

echo Fething ACR resource id...
acrId=$(az acr show --resource-group $GROUP --name $REGISTRY --query "id" --output tsv)

echo Creating role assignment...
az role assignment create --assignee $appId --scope $acrId --role acrpull

# TODO This breaks here. Maybe sleep for a few seconds to see if that fixes it.

echo Creating Kubernetes cluster...
az aks create \
    --resource-group $GROUP \
    --name $CLUSTER \
    --node-count 1 \
    --service-principal $appId \
    --client-secret $password \
    --generate-ssh-keys

echo Fetching credentials...
az aks get-credentials --resource-group $GROUP --name $CLUSTER
