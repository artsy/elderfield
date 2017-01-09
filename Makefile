ARTSY_CLIENT_ID=8198312f86b95300946b
ARTSY_CLIENT_SECRET=99ba69754592e7d4cce2bb319ece15b4
ARTSY_BASE_API_URL=https://stagingapi.artsy.net/api

KEYS=ARTSY_CLIENT_ID=$(ARTSY_CLIENT_ID) ARTSY_CLIENT_SECRET=$(ARTSY_CLIENT_SECRET) ARTSY_BASE_API_URL=$(ARTSY_BASE_API_URL)

# Start the server
s:
	ENV=development $(KEYS)	node server.js

# Build
build:
	npm install
	cd functions/artsy && npm install
	cd functions/artsy && node index.js

# Deploy to AWS Lambda
deploy: build
	apex deploy

# Test
test: build
	ENV=test $(KEYS) ./node_modules/mocha/bin/mocha

# Test
coverage: build
	ENV=test $(KEYS) npm run coverage

production-deploy: build
	apex deploy --env=production
