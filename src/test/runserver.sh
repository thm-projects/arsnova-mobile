#!/bin/bash
set -ev

mvn jetty:run -Dmobile.path="$ARSNOVA_MOBILE_PATH" &

RESPONSE_CODE=0
while [ "$RESPONSE_CODE" -ne 200 ]
do
	RESPONSE_CODE=`curl -s -o /dev/null -I -w "%{http_code}" -m 5 "${$ARSNOVA_URL}"`
	sleep 5
	echo -e ".\c"
done
