#!/bin/bash

# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "-e" ]; then
	echo -n "Paste page here: "
	nano -mx main.cpp
else
	#read input and trim everything before the first #include
	#and after the last }
	cat |
	perl -0777 -nE 'say /(#include.*})/s' |
	sed -E 's/“|”/"/g ; s/\b[Ee]lsecout\b/else cout/g ; s/\b[Ee]lseif\b/else if/g ; s/\bIf\b/if/g ; s/\bElse\b/else/g ; s/\bInt\b/int/g; s/\bFloat\b/float/g ; s/\bDouble\b/double/g ; s/\bUsing\b/using/g ; s/\bCout\b/cout/g ; s/\bCin\b/cin/g ; s/\bReturn\b/return/g' |
	sed -E 's/(else if|if|while|do|for) *\(/\n\1 (/g ; s/else *\{/\nelse \{/g ; s/cout *<</\ncout << /g ; s/cin *>>/cin >> /g' \
	> main.cpp
fi

# open the editor if the code contains compiler errors
while ! g++ main.cpp; do
	read -p "Press enter to compile again."
	nano -mx main.cpp
done

./a.out
echo ""
