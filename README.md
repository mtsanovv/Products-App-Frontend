# TechStore-App-Frontend

Frontend UI for the Java Spring REST app that has to maintain users and products, located here: [TechStore-App-Backend](https://github.com/mtsanovv/TechStore-App-Backend)

## Configuring the frontend
That's actually fairly easy. Go to the ```scripts``` directory and edit the config.js file to point to the TechStore REST API.s

## Notes
- Always use HTTPS for requests to the REST API because it uses basic HTTP authentication (and that thing is insanely vulnerable over insecure connections).