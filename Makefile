include .env
export

release:
	web-ext sign --ignore-files private --api-key $$AMO_USER --api-secret $$AMO_SECRET
	xdg-open $$CHROME_URL
