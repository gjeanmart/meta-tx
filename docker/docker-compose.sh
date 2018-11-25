#!/bin/bash

echo "removing old containers"
docker-compose down
[ $? -eq 0 ] || exit $?; 

echo "Build"
docker-compose build 
[ $? -eq 0 ] || exit $?; 

echo "Start"
docker-compose up 
[ $? -eq 0 ] || exit $?; 

trap "docker-compose kill" INT
