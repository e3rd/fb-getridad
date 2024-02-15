include .env
export
TAG := `grep version manifest.json | pz --search ': "(\d+\.\d+\.\d+)"'`

release:
# Chrome
	web-ext build --ignore-files private
	xdg-open web-ext-artifacts/
	xdg-open $$CHROME_URL
# Create new tag
	git tag $(TAG)
	git push origin $(TAG)
# FF (last as this fails because this is a listed add-on)
	web-ext sign --ignore-files private --api-key $$AMO_USER --api-secret $$AMO_SECRET