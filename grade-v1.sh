#!/bin/bash

# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "-e" ]; then
	nano -mx main.cpp
else
	echo -n "Paste page here: "
	cat > main.cpp
fi

cat main.cpp |
perl -0777 -nE 'say /(#include.*})/s' |
sed -E 's/“|”/"/g ; s/[[:<:]][Ee]lsecout[[:>:]]/else cout/g ; s/[[:<:]][Ee]lseif[[:>:]]/else if/g ; s/[[:<:]]If[[:>:]]/if/g ; s/[[:<:]]Else[[:>:]]/else/g ; s/[[:<:]]Int[[:>:]]/int/g; s/[[:<:]]Float[[:>:]]/float/g ; s/[[:<:]]Double[[:>:]]/double/g ; s/[[:<:]]Using[[:>:]]/using/g ; s/[[:<:]]Cout[[:>:]]/cout/g ; s/[[:<:]]Cin[[:>:]]/cin/g ; s/[[:<:]]Return[[:>:]]/return/g' |
sed -E 's/(else[[:space:]]if|if|while|do|for)[[:space:]]*\(/\n\1 (/g ; s/else[[:space:]]*\{/\nelse \{/g ; s/cout[[:space:]]*\<\</\ncout << /g ; s/cin[[:space:]]*\>\>/\ncin >> /g' \
> main.cpp

# open the editor if the code contains compiler errors
while ! g++ main.cpp; do
	read -p "Press enter to open the editor."
	nano -mx main.cpp
done

clear
./a.out
echo ""
