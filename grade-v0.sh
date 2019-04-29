#!/bin/bash



# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "-e" ]; then
	nano -mx main.cpp
else
	cat |
	awk 'BEGIN {found = 0} {if (found) {print} else if ($0 ~ /#include/) {found = 1; print}}' |
	sed -E 's/[^#\n]*#include/#include/' |
	sed -E 's/;[[:space:]]+/;/g ; s/\}[[:space:]]+/\}/g' |
	sed -E 's/“|”/"/g ; s/(;|\{)/\1\n/g ; s/([^ ])\{/\1 \{/g ; s/\}/\n\}\n\n/g ; s/(#include[ ]*\<[^\>]*\>)/\1\n/g' |
	sed -E 's/[[:<:]][Ee]lsecout[[:>:]]/else cout/g ; s/[[:<:]][Ee]lseif[[:>:]]/else if/g ; s/[[:<:]]If[[:>:]]/if/g ; s/[[:<:]]Else[[:>:]]/else/g ; s/[[:<:]]Int[[:>:]]/int/g ; s/[[:<:]]Using[[:>:]]/using/g ; s/[[:<:]]Cout[[:>:]]/cout/g ; s/[[:<:]]Cin[[:>:]]/cin/g ; s/[[:<:]]Return[[:>:]]/return/g' |
	sed -E 's/(else[[:space:]]if|if|while|do|for)[[:space:]]*\(/\n\1 (/g ; s/else[[:space:]]*\{/\nelse \{/g ; s/cout[[:space:]]*\<\</\ncout << /g ; s/cin[[:space:]]*\>\>/\ncin >> /g' |
	sed -E 's/\n{2,}/\n/g' |
	sed -E 's/ \n/\n/g' \
	> main.cpp
fi

# open the editor if the code contains compiler errors
while ! g++ main.cpp; do
	read -p "Press enter to open the editor."
	nano -mx main.cpp
done

./a.out
echo ""

#for argument in ; do
#	echo ""
#	echo -n "input: "
#	echo $argument | tee /dev/tty | ./a.out
#	echo ""
#done
