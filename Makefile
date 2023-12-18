include .env
export

release:
# Chome
	web-ext build --ignore-files private
	xdg-open $$CHROME_URL
# FF
	web-ext sign --ignore-files private --api-key $$AMO_USER --api-secret $$AMO_SECRET
