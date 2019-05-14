#!/bin/bash

# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "--editor" ]; then
	nano -mx main.cpp
elif [ "$1" == "--termux" ]; then
	termux-clipboard-get > main.cpp
elif [ "$1" == "--xclip" ]; then
	xclip -o > main.cpp
else
	#overwrite file with input from clipboard
	IFS=''
	read -srp "Paste C++ code: " code
	while read -srt 0.25 line
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
echo 10 7 15 3 13 | ./a.out
echo ""
echo ""

echo 15 10 7 13 3 | ./a.out
echo ""
echo ""
