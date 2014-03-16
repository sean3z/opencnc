#!/bin/bash

SUCCESS="$(tput setaf 4)[$(tput setaf 2)ok$(tput setaf 4)]$(tput sgr0)"
FAIL="$(tput setaf 4)[$(tput setaf 1)fail$(tput setaf 4)]$(tput sgr0)"
GBULLET="$(tput setaf 2)*$(tput setaf 7)"
RBULLET="$(tput setaf 1)*$(tput setaf 7)"
GRAQUO="$(tput setaf 2)>>$(tput setaf 7)"

printf "%s\n" "$(tput bold)$GRAQUO Initalizing $(tput setaf 3)C&C node.js server $(tput setaf 6)0.1$(tput sgr0)"

printf "%s\t\t%s\n" "$(tput bold)$GBULLET Removing old debug/*.out logs ..." $SUCCESS
rm -f debug/*.out

printf "%s\n" "$(tput bold)$GBULLET Starting WOLv2 Servers"

# Check if node is running
if ps aux | grep [n]ode > /dev/null
then
    printf "%s\t%s\t\t%s\n" "$(tput bold)$RBULLET" "Stopping current servers ..." $SUCCESS
    killall -2 node
else 
    printf "%s\t%s\t\t%s\n" "$(tput bold)$GBULLET" "No current servers running ..." $SUCCESS
fi

printf "%s\t%s\t\t%s\n" "$(tput bold)$GBULLET" "Starting Server Server ..." $SUCCESS
nohup node servers/WOLv2/servserv.js &> debug/servserv.out 2>&1 &

printf "%s\t%s\t%s\n" "$(tput bold)$GBULLET" "Starting Red Alert 2 chat server ..." $SUCCESS
nohup node servers/WOLv2/redalert2.js &> debug/redalert2.out 2>&1 &

printf "%s\t%s\t%s\n" "$(tput bold)$GBULLET" "Starting Tiberian Sun chat server ..." $SUCCESS
nohup node servers/WOLv2/tiberiansun.js &> debug/tiberiansun.out 2>&1 &

printf "%s\t%s\t\t%s\n" "$(tput bold)$GBULLET" "Starting Ladder Server ..." $SUCCESS
nohup node servers/WOLv2/ladder.js &> debug/ladder.out 2>&1 &

## printf "%s\t%s\t%s\n" "$(tput bold)$GBULLET" "Starting API Register Server ..." $SUCCESS
## nohup node servers/WOLv2/apiregister.js &> debug/apiregister.out 2>&1 &