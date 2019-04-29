#!/bin/bash

# if the user specifies -e, then just edit the previous input rather than
# getting a new program from stdin
if [ "$1" == "-e" ]; then
	nano -mx main.cpp
	code=$(cat main.cpp)
else
	#overwrite file with input from keyboard
	echo -n "Paste here: "
	code=$(cat)
fi

echo "$code" |
perl -0777 -nE 'say /(#include.*})/s' |
sed -E 's/“|”/"/g ; s/[[:<:]][Ee]lsecout[[:>:]]/else cout/g ; s/[[:<:]][Ee]lseif[[:>:]]/else if/g ; s/[[:<:]]If[[:>:]]/if/g ; s/[[:<:]]Else[[:>:]]/else/g ; s/[[:<:]]Int[[:>:]]/int/g; s/[[:<:]]Float[[:>:]]/float/g ; s/[[:<:]]Double[[:>:]]/double/g ; s/[[:<:]]Using[[:>:]]/using/g ; s/[[:<:]]Cout[[:>:]]/cout/g ; s/[[:<:]]Cin[[:>:]]/cin/g ; s/[[:<:]]Return[[:>:]]/return/g ; s/[[:<:]]While[[:>:]]/while/g ; s/[[:<:]]For[[:>:]]/for/g' |
awk '(NR-1)%2{$1=$1}1' RS=\" ORS=\" | sed '$d' |
sed -E 's/^ +//g' |
sed -E -n '/^double|^float|^int|^do|^while|^return|^if|^else|\,|\!|\%|\^|\&|\*|\(|\)|\-|\=|\+|\<|\>|\?|\;|\:|\"|\{|\}|\[|\]|\\|\//p' \
> main.cpp

#remove single line comments
#perl -pe 's;//.*?\n;;g'

#remove newlines not following a > character
#perl -pe 's;(?<!\>)\R;;g'
#perl -pe 's/(?<![>;){}])\R//g'

#remove newlines located between double quotes
#awk '(NR-1)%2{$1=$1}1' RS=\" ORS=\" | sed '$d'

# open the editor if the code contains compiler errors
while ! g++ main.cpp; do
	read -p "Press enter to compile again."
	nano -mx main.cpp
done

clear
if cat main.cpp | grep -q 'calculateRetail('; then
	echo -n "contains"
else
	echo -n "missing"
fi

echo " calculateRetail()"
echo ""

echo 50 10 | ./a.out
echo ""
echo ""

echo -50 50 -10 10 50 50 50 50 50 | ./a.out
echo ""
echo ""
