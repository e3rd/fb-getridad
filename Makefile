include .env
export

release:
	web-ext sign --ignore-files private --api-key $$AMO_USER --api-secret $$AMO_SECRET --id $$AMO_ID
# continue to https://chrome.google.com/webstore/devconsole/
