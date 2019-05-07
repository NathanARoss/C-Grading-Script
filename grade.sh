#!/bin/bash

# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "-e" ]; then
	nano -mx main.cpp
else
	#overwrite file with input from keyboard
	IFS=''
	read -s -p "Paste C++ code: " code
	while read -s -t 0.25 line
	do
		code+="
$line"
	done
	echo "$code" > main.cpp
fi

# open the editor if the code contains compiler errors
while ! g++ main.cpp; do
	read -p "Press enter to open the editor."
	nano -mx main.cpp
done

clear
./a.out
